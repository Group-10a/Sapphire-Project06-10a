import React, { useEffect, useRef, useState, useReducer } from 'react';
import '../../ActivityLevels.less';
import {
  compileArduinoCode,
  handleCreatorSaveActivity,
  handleCreatorSaveActivityLevel,
  handleUpdateWorkspace,
} from '../../Utils/helpers';
import { message, Spin, Row, Col, Alert, Dropdown, Menu } from 'antd';
import CodeModal from '../modals/CodeModal';
import SaveAsModal from '../modals/SaveAsModal';
import ConsoleModal from '../modals/ConsoleModal';
import PlotterModal from '../modals/PlotterModal';
import StudentToolboxMenu from '../modals/StudentToolboxMenu';
import LoadWorkspaceModal from '../modals/LoadWorkspaceModal';
import DisplayDiagramModal from '../modals/DisplayDiagramModal'
import GeneratorModal from '../modals/GeneratorModal';
import {
  connectToPort,
  handleCloseConnection,
  handleOpenConnection,
} from '../../Utils/consoleHelpers';
import {
  getAuthorizedWorkspace,
  getAuthorizedWorkspaceToolbox,
} from '../../../../Utils/requests';
import IconHammer from '../Icons/IconHammer';
import ArduinoLogo from '../Icons/ArduinoLogo';
import PlotterLogo from '../Icons/PlotterLogo';
import { useNavigate } from 'react-router-dom';

let plotId = 1;

export default function ContentCreatorCanvas({
  activity,
  isSandbox,
  setActivity,
  isMentorActivity,
}) {
  const [hoverGenerator, setHoverGenerator] = useState(false);
  const [hoverUndo, setHoverUndo] = useState(false);
  const [hoverRedo, setHoverRedo] = useState(false);
  const [hoverCompile, setHoverCompile] = useState(false);
  const [hoverConsole, setHoverConsole] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [showPlotter, setShowPlotter] = useState(false);
  const [showSaveAsModal, setShowSaveAsModal] = useState(false);
  const [plotData, setPlotData] = useState([]);
  const [connectionOpen, setConnectionOpen] = useState(false);
  const [selectedCompile, setSelectedCompile] = useState(false);
  const [compileError, setCompileError] = useState('');
  const [studentToolbox, setStudentToolbox] = useState([]);
  const [openedToolBoxCategories, setOpenedToolBoxCategories] = useState([]);

  const navigate = useNavigate();
  const [forceUpdate] = useReducer((x) => x + 1, 0);
  const workspaceRef = useRef(null);
  const generatorRef = useRef(null);
  const activityRef = useRef(null);

  const setWorkspace = () => {
    workspaceRef.current = window.Blockly.inject('blockly-canvas', {
      toolbox: document.getElementById('toolbox'),
    });
  };

  const setGenerator = () => {
    generatorRef.current = window.Blockly.inject('blockly', {
      toolbox: document.getElementById('toolbox'),
    });
  };

  const loadSave = async (workspaceId) => {
    // get the corresponding workspace
    const res = await getAuthorizedWorkspace(workspaceId);
    if (res.data) {
      // set up the canvas
      if (workspaceRef.current) workspaceRef.current.clear();
      let xml = window.Blockly.Xml.textToDom(res.data.template);
      window.Blockly.Xml.domToWorkspace(xml, workspaceRef.current);

      // if we are not in sandbox mode, only the canvas will be changed.
      // set the toolbox here
      if (!isSandbox) {
        const toolboxRes = await getAuthorizedWorkspaceToolbox(workspaceId);
        if (toolboxRes.data) {
          let tempCategories = [],
            tempToolBox = [];
          toolboxRes.data.toolbox &&
            toolboxRes.data.toolbox.forEach(([category, blocks]) => {
              tempCategories.push(category);
              tempToolBox = [
                ...tempToolBox,
                ...blocks.map((block) => block.name),
              ];
            });

          setOpenedToolBoxCategories(tempCategories);
          setStudentToolbox(tempToolBox);
        }
      }

      // else if we are in sandbox, we will change the current workspace to the loaded worksapce
      else {
        // set up the student toolbox
        const toolboxRes = await getAuthorizedWorkspaceToolbox(res.data.id);
        if (toolboxRes.data) {
          //update localstorage
          let localActivity = {
            ...res.data,
            selectedToolbox: toolboxRes.data.toolbox,
            toolbox: activity.toolbox,
          };
          setActivity(localActivity);
        }
      }
      return true;
    } else {
      message.error(res.err);
      return false;
    }
  };

  const handleGoBack = () => {
    if (
      window.confirm(
        'All unsaved progress will be lost. Do you still want to go back?'
      )
    )
      navigate(-1);
  };

  useEffect(() => {
    // once the activity state is set, set the workspace and save
    const setUp = async () => {
      activityRef.current = activity;
      if (!workspaceRef.current && activity && Object.keys(activity).length !== 0) {
        setWorkspace();

        let xml = isMentorActivity
          ? window.Blockly.Xml.textToDom(activity.activity_template)
          : window.Blockly.Xml.textToDom(activity.template);
        window.Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
        workspaceRef.current.clearUndo();
      }
    };
    setUp();
  }, [activity, isSandbox]);

  const handleCreatorSave = async () => {
    // Save activity template
    if (!isSandbox && !isMentorActivity) {
      const res = await handleCreatorSaveActivityLevel(
        activity.id,
        workspaceRef,
        studentToolbox
      );
      if (res.err) {
        message.error(res.err);
      } else {
        message.success('Activity Template saved successfully');
      }
    } else if (!isSandbox && isMentorActivity) {
      // Save activity template
      const res = await handleCreatorSaveActivity(activity.id, workspaceRef);
      if (res.err) {
        message.error(res.err);
      } else {
        message.success('Activity template saved successfully');
      }
    } else {
      // if we already have the workspace in the db, just update it.
      if (activity && activity.id) {
        const updateRes = await handleUpdateWorkspace(
          activity.id,
          workspaceRef,
          studentToolbox
        );
        if (updateRes.err) {
          message.error(updateRes.err);
        } else {
          message.success('Workspace saved successfully');
        }
      }
      // else create a new workspace and update local storage
      else {
        setShowSaveAsModal(true);
      }
    }
  };

  const handleUndo = () => {
    if (workspaceRef.current.undoStack_.length > 0)
      workspaceRef.current.undo(false);
  };

  const handleRedo = () => {
    if (workspaceRef.current.redoStack_.length > 0)
      workspaceRef.current.undo(true);
  };

  const handleConsole = async () => {
    if (showPlotter) {
      message.warning('Close serial plotter before openning serial monitor');
      return;
    }
    // if serial monitor is not shown
    if (!showConsole) {
      // connect to port
      await handleOpenConnection(9600, 'newLine');
      // if fail to connect to port, return
      if (typeof window['port'] === 'undefined') {
        message.error('Fail to select serial device');
        return;
      }
      setConnectionOpen(true);
      setShowConsole(true);
    }
    // if serial monitor is shown, close the connection
    else {
      if (connectionOpen) {
        await handleCloseConnection();
        setConnectionOpen(false);
      }
      setShowConsole(false);
    }
  };

  const handlePlotter = async () => {
    if (showConsole) {
      message.warning('Close serial monitor before openning serial plotter');
      return;
    }

    if (!showPlotter) {
      await handleOpenConnection(
        9600,
        'plot',
        plotData,
        setPlotData,
        plotId,
        forceUpdate
      );
      if (typeof window['port'] === 'undefined') {
        message.error('Fail to select serial device');
        return;
      }
      setConnectionOpen(true);
      setShowPlotter(true);
    } else {
      plotId = 1;
      if (connectionOpen) {
        await handleCloseConnection();
        setConnectionOpen(false);
      }
      setShowPlotter(false);
    }
  };

  const handleCompile = async () => {
    if (showConsole || showPlotter) {
      message.warning(
        'Close Serial Monitor and Serial Plotter before uploading your code'
      );
    } else {
      if (typeof window['port'] === 'undefined') {
        await connectToPort();
      }
      if (typeof window['port'] === 'undefined') {
        message.error('Fail to select serial device');
        return;
      }
      setCompileError('');
      await compileArduinoCode(
        workspaceRef.current,
        setSelectedCompile,
        setCompileError,
        activity,
        false
      );
    }
  };

  const handleGenerator = async () => {
    alert("This is the block generator.");
  }

  const menu = (
    <Menu>
      <Menu.Item id='menu-save' onClick={handleCreatorSave}>
        <i className='fa fa-save' />
        &nbsp; Save
      </Menu.Item>
      <SaveAsModal
        visible={showSaveAsModal}
        setVisible={setShowSaveAsModal}
        workspaceRef={workspaceRef}
        studentToolbox={studentToolbox}
        activity={activity}
        setActivity={setActivity}
        isSandbox={isSandbox}
      />
      <LoadWorkspaceModal loadSave={loadSave} />
    </Menu>
  );

  const menuShow = (
    <Menu>
      <Menu.Item onClick={handlePlotter}>
        <PlotterLogo />
        &nbsp; Show Serial Plotter
      </Menu.Item>
      <CodeModal title={'XML'} workspaceRef={workspaceRef.current} />
      <Menu.Item>
        <CodeModal title={'Arduino Code'} workspaceRef={workspaceRef.current} />
      </Menu.Item>
    </Menu>
  );

  return (
    <div id='horizontal-container' className='flex flex-column'>
      <div className='flex flex-row'>
        <div
          id='bottom-container'
          className='flex flex-column vertical-container overflow-visible'
        >
          <Spin
            tip='Compiling Code Please Wait... It may take up to 20 seconds to compile your code.'
            className='compilePop'
            size='large'
            spinning={selectedCompile}
          >
            <Row id='icon-control-panel'>
              <Col flex='none' id='section-header'>
                {activity.lesson_module_name
                  ? `${activity.lesson_module_name} - Activity ${activity.number} - ${
                      isMentorActivity ? 'Activity' : 'Activity Level'
                    } Template`
                  : activity.name
                  ? `Workspace: ${activity.name}`
                  : 'New Workspace!'}
              </Col>
              <Col flex='auto'>
                <Row align='middle' justify='end' id='description-container'>
                  <Col flex={'30px'}>
                    <button
                      onClick={handleGoBack}
                      id='link'
                      className='flex flex-column'
                    >
                      <i id='icon-btn' className='fa fa-arrow-left' />
                    </button>
                  </Col>
                  <Col flex='auto' />
                  <Row>
                    
                    {/* Start of Generator icon */}
                    {/*
                    <Col className='flex flex-row'>
                      <div
                        id='action-btn-container'
                        className='flex space-around'
                      >
                        <IconHammer
                          setHoverGenerator={setHoverGenerator}
                          handleGenerator={handleGenerator}
                          onMouseEnter={() => setHoverGenerator(true)}
                          onMouseLeave={() => setHoverGenerator(false)}
                        />
                        {hoverGenerator && (
                          <div className='popup ModalCompile3'>Generate Custom Block</div>
                        )}
                        <GeneratorModal
                          image={activity.images}
                        />
                      </div>
                    </Col>
                    */}
                    {/*
                    <Col className='flex flex-row'>
                      <GeneratorModal title={'Generator'} workspaceRef={workspaceRef.current} />
                    </Col>
                    */}
                    
                    <Col className='flex flex-row'>
                      <div
                        id='action-btn-container'
                        className='flex space-around'
                      >
                        <IconHammer
                          setHoverGenerator={setHoverGenerator}
                          handleGenerator={handleGenerator}
                          //onMouseEnter={() => setHoverGenerator(true)}
                          //onMouseLeave={() => setHoverGenerator(false)}
                        />
                        {hoverGenerator && (
                          <div className='popup ModalCompile3'>Generate Custom Block</div>
                        )}
                      </div>
                    </Col>

                    {/* End of Generator icon */}

                    <Col className='flex flex-row'>
                      <Col
                        className='flex flex-row'
                        id='save-dropdown-container'
                      >
                        <Dropdown overlay={menu}>
                          <i id='save-icon-btn' className='fa fa-save' />
                        </Dropdown>
                        <i className='fas fa-angle-down' id='caret'></i>
                      </Col>
                    </Col>
                    <Col className='flex flex-row' id='redo-undo-container'>
                      <button
                        onClick={handleUndo}
                        id='link'
                        className='flex flex-column'
                      >
                        <i
                          id='icon-btn'
                          className='fa fa-undo-alt'
                          style={
                            workspaceRef.current
                              ? workspaceRef.current.undoStack_.length < 1
                                ? { color: 'grey', cursor: 'default' }
                                : null
                              : null
                          }
                          onMouseEnter={() => setHoverUndo(true)}
                          onMouseLeave={() => setHoverUndo(false)}
                        />
                        {hoverUndo && (
                          <div className='popup ModalCompile4'>Undo</div>
                        )}
                      </button>
                      <button
                        onClick={handleRedo}
                        id='link'
                        className='flex flex-column'
                      >
                        <i
                          id='icon-btn'
                          className='fa fa-redo-alt'
                          style={
                            workspaceRef.current
                              ? workspaceRef.current.redoStack_.length < 1
                                ? { color: 'grey', cursor: 'default' }
                                : null
                              : null
                          }
                          onMouseEnter={() => setHoverRedo(true)}
                          onMouseLeave={() => setHoverRedo(false)}
                        />
                        {hoverRedo && (
                          <div className='popup ModalCompile4'>Redo</div>
                        )}
                      </button>
                    </Col>
                    <Col className='flex flex-row'>
                      <div
                        id='action-btn-container'
                        className='flex space-around'
                      >
                        <ArduinoLogo
                          setHoverCompile={setHoverCompile}
                          handleCompile={handleCompile}
                        />
                        {hoverCompile && (
                          <div className='popup ModalCompile'>
                            Upload to Arduino
                          </div>
                        )}
                  <DisplayDiagramModal
                      image={activity.images}
                    />
                        <i
                          onClick={() => handleConsole()}
                          className='fas fa-terminal hvr-info'
                          style={{ marginLeft: '6px' }}
                          onMouseEnter={() => setHoverConsole(true)}
                          onMouseLeave={() => setHoverConsole(false)}
                        />
                        {hoverConsole && (
                          <div className='popup ModalCompile'>
                            Show Serial Monitor
                          </div>
                        )}
                        <Dropdown overlay={menuShow}>
                          <i className='fas fa-ellipsis-v'></i>
                        </Dropdown>
                      </div>
                    </Col>
                  </Row>
                </Row>
              </Col>
            </Row>
            <div id='blockly-canvas' />
          </Spin>
        </div>
        {!isMentorActivity && (
          <StudentToolboxMenu
            activity={activity}
            studentToolbox={studentToolbox}
            setStudentToolbox={setStudentToolbox}
            openedToolBoxCategories={openedToolBoxCategories}
            setOpenedToolBoxCategories={setOpenedToolBoxCategories}
          />
        )}
        <ConsoleModal
          show={showConsole}
          connectionOpen={connectionOpen}
          setConnectionOpen={setConnectionOpen}
        ></ConsoleModal>
        <PlotterModal
          show={showPlotter}
          connectionOpen={connectionOpen}
          setConnectionOpen={setConnectionOpen}
          plotData={plotData}
          setPlotData={setPlotData}
          plotId={plotId}
        />
      </div>
      
      {/* Start of Block Generator */}

      <div className='flex flex-row'>
        <div
          id='bottom-container'
          className='flex flex-column vertical-container overflow-visible'
        >
        <h1>Block Generator</h1>
        <h2>Define custom blocks here!</h2>

        <Col>
          <table id='blockFactoryContent'>
              <tr width="100%" height="10%">
                  <td width="50%" height="5%">
                      <table>
                          <tr id="blockLibrary">
                              <td id="blockLibraryContainer">
                      <span>
                        <div class="dropdown">
                          <button id="button_blockLib">Block Library</button>
                          <div id="dropdownDiv_blockLib" class="dropdown-content">
                            <a id="createNewBlockButton">Create New Block</a>
                          </div>
                        </div>
                        <label for="blockLibraryDropdown"></label><select id="blockLibraryDropdown">
                        </select>
                      </span>
                              </td>
                              <td id="blockLibraryControls">
                                  <button id="saveToBlockLibraryButton" title="Save block to Block Library.">
                                      Save "block_type"
                                  </button>
                                  <button id="removeBlockFromLibraryButton" title="Remove block from Block Library.">
                                      Delete "block_type"
                                  </button>
                              </td>
                          </tr>
                      </table>
                  </td>
                  <td height="5%">
                      <table id="blockFactoryPreview">
                          <tr>
                              <td id="previewContainer">
                                  <h3>Preview:
                                      <label for="direction"></label><select id="direction">
                                          <option value="ltr">LTR</option>
                                          <option value="rtl">RTL</option>
                                      </select>
                                  </h3>
                              </td>
                              <td id="buttonContainer">
                                  <button id="linkButton" title="Save and link to blocks.">
                                      {/*<img src="link.png" height="21" width="21" alt=""></img>*/}
                                  </button>
                                  <button id="clearBlockLibraryButton" title="Clear Block Library.">
                                      <span>Clear Library</span>
                                  </button>
                                  <label for="files" class="buttonStyle">
                                      <span>Import Block Library</span>
                                  </label>
                                  <input id="files" type="file" name="files"
                                        accept="application/xml"></input>
                                  <button id="localSaveButton" title="Save block library XML to a local file.">
                                      <span>Download Block Library</span>
                                  </button>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
              <tr height="80%">
                  <td id="blocklyWorkspaceContainer">
                      <div id='blockly'></div>
                      <div id='blocklyMask'></div>
                  </td>
                  <td width="50%">
                      <table id="blocklyPreviewContainer">
                          <tr>
                              <td height="30%">
                                  <div id="preview"></div>
                              </td>
                          </tr>
                          <tr>
                              <td height="5%">
                                  <h3>Block Definition:
                                      <label for="format"></label><select id="format">
                                          <option value="JavaScript">JavaScript</option>
                                          <option value="JSON">JSON</option>
                                      </select>
                                  </h3>
                              </td>
                          </tr>
                          <tr>
                              <td height="30%">
                                  <pre id="languagePre" class="prettyprint lang-js"></pre>
                                  <label for="languageTA"></label><textarea id="languageTA"></textarea>
                              </td>
                          </tr>
                          <tr>
                              <td height="5%">
                                  <h3>Generator stub:
                                      <label for="language"></label><select id="language">
                                          <option value="Arduino">Arduino</option>
                                      </select>
                                  </h3>
                              </td>
                          </tr>
                          <tr>
                              <td height="30%">
                                  <pre id="generatorPre" class="prettyprint lang-js"></pre>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>

          <div id="modalShadow"></div>
          
          <xml id="blockfactory_toolbox" class="toolbox">
              <category name="Input">
                  <block type="input_value">
                      <value name="TYPE">
                          <shadow type="type_null"></shadow>
                      </value>
                  </block>
                  <block type="input_statement">
                      <value name="TYPE">
                          <shadow type="type_null"></shadow>
                      </value>
                  </block>
                  <block type="input_dummy"></block>
              </category>
              <category name="Field">
                  <block type="field_static"></block>
                  <block type="field_label_serializable"></block>
                  <block type="field_input"></block>
                  <block type="field_number"></block>
                  <block type="field_angle"></block>
                  <block type="field_dropdown"></block>
                  <block type="field_checkbox"></block>
                  <block type="field_colour"></block>
                  <block type="field_variable"></block>
                  <block type="field_image"></block>
              </category>
              <category name="Type">
                  <block type="type_group"></block>
                  <block type="type_null"></block>
                  <block type="type_boolean"></block>
                  <block type="type_number"></block>
                  <block type="type_string"></block>
                  <block type="type_list"></block>
                  <block type="type_other"></block>
              </category>
              <category name="Colour" id="colourCategory">
                  <block type="colour_hue">
                      <mutation colour="20"></mutation>
                      <field name="HUE">20</field>
                  </block>
                  <block type="colour_hue">
                      <mutation colour="65"></mutation>
                      <field name="HUE">65</field>
                  </block>
                  <block type="colour_hue">
                      <mutation colour="120"></mutation>
                      <field name="HUE">120</field>
                  </block>
                  <block type="colour_hue">
                      <mutation colour="160"></mutation>
                      <field name="HUE">160</field>
                  </block>
                  <block type="colour_hue">
                      <mutation colour="210"></mutation>
                      <field name="HUE">210</field>
                  </block>
                  <block type="colour_hue">
                      <mutation colour="230"></mutation>
                      <field name="HUE">230</field>
                  </block>
                  <block type="colour_hue">
                      <mutation colour="260"></mutation>
                      <field name="HUE">260</field>
                  </block>
                  <block type="colour_hue">
                      <mutation colour="290"></mutation>
                      <field name="HUE">290</field>
                  </block>
                  <block type="colour_hue">
                      <mutation colour="330"></mutation>
                      <field name="HUE">330</field>
                  </block>
              </category>
          </xml>
        </Col>

        </div>
      </div>

      {/* End of Block Generator */}
        
      {/* This xml is for the blocks' menu we will provide. Here are examples on how to include categories and subcategories */}
      <xml id='toolbox' is='Blockly workspace'>
        {
          // Maps out block categories
          activity &&
            activity.toolbox &&
            activity.toolbox.map(([category, blocks]) => (
              <category name={category} is='Blockly category' key={category}>
                {
                  // maps out blocks in category
                  // eslint-disable-next-line
                  blocks.map((block) => {
                    return (
                      <block
                        type={block.name}
                        is='Blockly block'
                        key={block.name}
                      />
                    );
                  })
                }
              </category>
            ))
        }
      </xml>

      {compileError && (
        <Alert
          message={compileError}
          type='error'
          closable
          onClose={(e) => setCompileError('')}
        ></Alert>
      )}
    </div>
  );
}
