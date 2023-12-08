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
    // Initializes the block generator, injecting necessary components
    const init = () => {
      BlocklyDevTools.Analytics.init();
      blocklyFactory = new AppController();
      blocklyFactory.init();
      window.addEventListener('beforeunload', blocklyFactory.confirmLeavePage);
    };

    // Callback that is called whenever the text within the tags containing
    // the block definition are changed
    const blockDefCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          setBD(mutation.target.textContent);
        }
      }
    };

    // Callback that is called whenever the text within the tags containing
    // the generator stub are changed
    const genStubCallback = (mutationList) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          setGS(mutation.target.textContent);
        }
      }
    };

    // Mutation Observers are used in order to call the setter functions
    // whenever the text within the respective tags are modified
    const bDObserver = new MutationObserver(blockDefCallback);
    const gSObserver = new MutationObserver(genStubCallback);
    const observerConfig = { childList: true, subtree: true };
    bDObserver.observe(block_def.current, observerConfig);
    gSObserver.observe(gen_stub.current, observerConfig);

    window.addEventListener('load', init);

    return () => {
      bDObserver.disconnect();
      gSObserver.disconnect();
    };
  }, []);

  return (
    <div
      id='bottom-container'
      className='flex flex-column vertical-container overflow-hidden'
    >
      <table id="blockFactoryContent" height="100%">
        <tr>
          <td>
            <table hidden="True">
              <tr id="blockLibrary">
                <td id="blockLibraryContainer">
                  <span hidden="True">
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
          <td width="30%" height="1px">
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
                <td id="buttonContainer" hidden="True">
                  <button id="linkButton" title="Save and link to blocks." hidden="True">
                  </button>
                  <button id="clearBlockLibraryButton" title="Clear Block Library." hidden="True">
                    {/*<span>Clear Library</span>*/}
                  </button>
                  <label for="files" class="buttonStyle" hidden="True">
                    {/*<span>Import Block Library</span>*/}
                  </label>
                  <input id="files" type="file" name="files" accept="application/xml" hidden="True"/>
                  <button id="localSaveButton" title="Save block library XML to a local file." hidden="True">
                    {/*<span>Download Block Library</span>*/}
                  </button>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr width="70%">
          <td id="blocklyWorkspaceContainer">
            <div id="blockly"></div>
            <div id="blocklyMask"></div>
          </td>
          <td>
            <table id="blocklyPreviewContainer">
              <tr>
                <td height="50%">
                  <div id="preview"></div>
                </td>
              </tr>
              <tr>
                <td>
                  {/*<h3>Block Definition*/}
                    <select id="format" hidden="True">
                      <option value="JavaScript">JavaScript</option>
                      {/*<option value="JSON">JSON</option>*/}
                    </select>
                  {/*</h3>*/}
                </td>
              </tr>
              <tr>
                <td>
                  <pre id="languagePre" class="prettyprint lang-js" ref={block_def} hidden="True"></pre>
                  <label for="languageTA" hidden="True"></label><textarea id="languageTA" hidden="True"></textarea>
                </td>
              </tr>
              <tr>
                <td>
                  {/*<h3>Generator stub:*/}
                    <select id="language" hidden="True">
                      <option value="Arduino">Arduino</option>
                      {/*<option value="JavaScript">JavaScript</option>*/}
                      {/*<option value="Python">Python</option>*/}
                      {/*<option value="PHP">PHP</option>*/}
                      {/*<option value="Lua">Lua</option>*/}
                      {/*<option value="Dart">Dart</option>*/}
                    </select>
                  {/*</h3>*/}
                </td>
              </tr>
              <tr>
                <td>
                  <pre id="generatorPre" class="prettyprint lang-js" ref={gen_stub} hidden="True"></pre>
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
        <category name="Colour" id="colourCategory" hidden="True">
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
  );
}