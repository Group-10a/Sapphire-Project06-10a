import { useRef, useEffect } from 'react'
import AppController from '../../../../../public/lib/GeneratorDependencies/app_controller.js'
import BlocklyDevTools from '../../../../../public/lib/GeneratorDependencies/analytics.js'

export default function BlockGenerator({
  setBD, setGS
}) {
  let blocklyFactory;

  const block_def = useRef(null);
  const gen_stub = useRef(null);

  useEffect(() => {
    const init = () => {
      BlocklyDevTools.Analytics.init();
      blocklyFactory = new AppController();
      blocklyFactory.init();
      window.addEventListener('beforeunload', blocklyFactory.confirmLeavePage);
    };

    const blockDefCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          setBD(mutation.target.textContent);
        }
      }
    };

    const genStubCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          setGS(mutation.target.textContent);
        }
      }
    };

    const bDObserver = new MutationObserver(blockDefCallback);
    const gSObserver = new MutationObserver(genStubCallback);
    const observerConfig = { childList: true, subtree: true };
    bDObserver.observe(block_def.current, observerConfig);
    gSObserver.observe(gen_stub.current, observerConfig);

    window.addEventListener('load', init);

    return () => {
      observer.disconnect();
    };
  }, []);

  return (
    <div className='flex flex-row'>
    <div
      id='bottom-container'
      className='flex flex-column vertical-container overflow-visible'
    >
        <table id="blockFactoryContent">
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
                  <select id="blockLibraryDropdown">
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
                    <select id="direction">
                      <option value="ltr">LTR</option>
                      <option value="rtl">RTL</option>
                    </select>
                  </h3>
                </td>
                <td id="buttonContainer">
                  <button id="linkButton" title="Save and link to blocks.">
                  </button>
                  <button id="clearBlockLibraryButton" title="Clear Block Library.">
                    <span>Clear Library</span>
                  </button>
                  <label for="files" class="buttonStyle">
                    <span>Import Block Library</span>
                  </label>
                  <input id="files" type="file" name="files"
                      accept="application/xml"/>
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
            <div id="blockly"></div>
            <div id="blocklyMask"></div>
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
                  <h3>Block Definition
                    <select id="format">
                      <option value="JSON">JSON</option>
                      <option value="JavaScript">JavaScript</option>
                    </select>
                  </h3>
                </td>
              </tr>
              <tr>
                <td height="30%">
                  <pre id="languagePre" class="prettyprint lang-js"
                        ref={block_def}></pre>
                  <label for="languageTA"></label><textarea id="languageTA"></textarea>
                </td>
              </tr>
              <tr>
                <td height="5%">
                  <h3>Generator stub:
                    <select id="language">
                      <option value="JavaScript">JavaScript</option>
                      <option value="Python">Python</option>
                      <option value="PHP">PHP</option>
                      <option value="Lua">Lua</option>
                      <option value="Dart">Dart</option>
                    </select>
                  </h3>
                </td>
              </tr>
              <tr>
                <td height="30%">
                  <pre id="generatorPre" class="prettyprint lang-js"
                        ref={gen_stub}></pre>
                </td>
              </tr>
            </table>
          </td>
          </tr>
      </table>

      <div id="modalShadow"></div>

      <xml xmlns="https://developers.google.com/blockly/xml" id="blockfactory_toolbox" class="toolbox">
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
          <block type="input_end_row"></block>
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
          <block type="colour_hue"><mutation colour="20"></mutation><field name="HUE">20</field></block>
          <block type="colour_hue"><mutation colour="65"></mutation><field name="HUE">65</field></block>
          <block type="colour_hue"><mutation colour="120"></mutation><field name="HUE">120</field></block>
          <block type="colour_hue"><mutation colour="160"></mutation><field name="HUE">160</field></block>
          <block type="colour_hue"><mutation colour="210"></mutation><field name="HUE">210</field></block>
          <block type="colour_hue"><mutation colour="230"></mutation><field name="HUE">230</field></block>
          <block type="colour_hue"><mutation colour="260"></mutation><field name="HUE">260</field></block>
          <block type="colour_hue"><mutation colour="290"></mutation><field name="HUE">290</field></block>
          <block type="colour_hue"><mutation colour="330"></mutation><field name="HUE">330</field></block>
        </category>
      </xml>
    </div>
    </div>
  );
}