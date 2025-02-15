/**
 * @license
 * Copyright 2016 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview JavaScript for Blockly's Block Factory application through
 * which users can build blocks using a visual interface and dynamically
 * generate a preview block and starter code for the block (block definition and
 * generator stub. Uses the Block Factory namespace. Depends on the FactoryUtils
 * for its code generation functions.
 *
 * @author fraser@google.com (Neil Fraser), quachtina96 (Tina Quach)
 */
'use strict';

import FactoryUtils from "./factory_utils";

/**
 * Namespace for Block Factory.
 */
var BlockFactory = BlockFactory || Object.create(null);

/**
 * Workspace for user to build block.
 * @type {Blockly.Workspace}
 */
BlockFactory.mainWorkspace = null;

/**
 * Workspace for preview of block.
 * @type {Blockly.Workspace}
 */
BlockFactory.previewWorkspace = null;

/**
 * Name of block if not named.
 * @type string
 */
BlockFactory.UNNAMED = 'unnamed';

/**
 * Existing direction ('ltr' vs 'rtl') of preview.
 * @type string
 */
BlockFactory.oldDir = null;

/**
 * Flag to signal that an update came from a manual update to the JSON or JavaScript.
 * definition manually.
 * @type boolean
 */
// TODO: Replace global state with parameter passed to functions.
BlockFactory.updateBlocksFlag = false;

/**
 * Delayed flag to avoid infinite update after updating the JSON or JavaScript.
 * definition manually.
 * @type boolean
 */
// TODO: Replace global state with parameter passed to functions.
BlockFactory.updateBlocksFlagDelayed = false;

/**
 * The starting XML for the Block Factory main workspace. Contains the
 * unmovable, undeletable factory_base block.
 */
BlockFactory.STARTER_BLOCK_XML_TEXT =
    '<xml xmlns="https://developers.google.com/blockly/xml">' +
    '<block type="factory_base" deletable="false" movable="false">' +
    '<value name="TOOLTIP">' +
    '<block type="text" deletable="false" movable="false">' +
    '<field name="TEXT"></field></block></value>' +
    '<value name="HELPURL">' +
    '<block type="text" deletable="false" movable="false">' +
    '<field name="TEXT"></field></block></value>' +
    '<value name="COLOUR">' +
    '<block type="colour_hue">' +
    '<mutation colour="#5b67a5"></mutation>' +
    '<field name="HUE">230</field>' +
    '</block></value></block></xml>';

/**
 * Change the language code format.
 */
BlockFactory.formatChange = function() {
  var mask = document.getElementById('blocklyMask');
  var languagePre = document.getElementById('languagePre');
  var languageTA = document.getElementById('languageTA');
  if (document.getElementById('format').value == 'Manual-JSON' ||
      document.getElementById('format').value == 'Manual-JS') {
    Blockly.hideChaff();
    mask.style.display = 'block';
    languagePre.style.display = 'none';
    languageTA.style.display = 'block';
    var code = languagePre.textContent.trim();
    languageTA.value = code;
    languageTA.focus();
    BlockFactory.updatePreview();
  } else {
    mask.style.display = 'none';
    languageTA.style.display = 'none';
    languagePre.style.display = 'block';
    var code = languagePre.textContent.trim();
    languageTA.value = code;

    BlockFactory.updateLanguage();
  }
  BlockFactory.disableEnableLink();
};

/**
 * Update the language code based on constructs made in Blockly.
 */
BlockFactory.updateLanguage = function() {
  var rootBlock = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
  if (!rootBlock) {
    return;
  }

  console.log(BlockFactory.mainWorkspace);
  var blockType = rootBlock.getFieldValue('NAME').trim().toLowerCase();
  if (!blockType) {
    blockType = BlockFactory.UNNAMED;
  }

  if (!BlockFactory.updateBlocksFlag) {
    var format = document.getElementById('format').value;
    if (format == 'Manual-JSON') {
      format = 'JSON';
    } else if (format == 'Manual-JS') {
      format = 'JavaScript';
    }

    var code = FactoryUtils.getBlockDefinition(blockType, rootBlock, format,
        BlockFactory.mainWorkspace);
    FactoryUtils.injectCode(code, 'languagePre');
    if (!BlockFactory.updateBlocksFlagDelayed) {
      var languagePre = document.getElementById('languagePre');
      var languageTA = document.getElementById('languageTA');
      code = languagePre.innerText.trim();
      languageTA.value = code;
    }
  }

  BlockFactory.updatePreview();
};

/**
 * Update the generator code.
 * @param {!Blockly.Block} block Rendered block in preview workspace.
 */
BlockFactory.updateGenerator = function(block) {
  var language = document.getElementById('language').value;
  var generatorStub = FactoryUtils.getGeneratorStub(block, language);
  FactoryUtils.injectCode(generatorStub, 'generatorPre');
};

/**
 * Update the preview display.
 */
BlockFactory.updatePreview = function() {
  // Toggle between LTR/RTL if needed (also used in first display).
  var newDir = document.getElementById('direction').value;
  if (BlockFactory.oldDir != newDir) {
    if (BlockFactory.previewWorkspace) {
      BlockFactory.previewWorkspace.dispose();
    }
    var rtl = newDir == 'rtl';
    BlockFactory.previewWorkspace = Blockly.inject('preview',
        {rtl: rtl,
         media: './src/assets/',
         scrollbars: true});
    BlockFactory.oldDir = newDir;
  }
  BlockFactory.previewWorkspace.clear();

  var format = BlockFactory.getBlockDefinitionFormat();
  var code = document.getElementById('languageTA').value;
  if (!code.trim()) {
    // Nothing to render.  Happens while cloud storage is loading.
    return;
  }

  // Backup Blockly.Blocks object so that main workspace and preview don't
  // collide if user creates a 'factory_base' block, for instance.
  var backupBlocks = Blockly.Blocks;
  try {
    // Make a shallow copy.
    Blockly.Blocks = Object.create(null);
    for (var prop in backupBlocks) {
      Blockly.Blocks[prop] = backupBlocks[prop];
    }

    if (format == 'JSON') {
      var json = JSON.parse(code);
      Blockly.Blocks[json.type || BlockFactory.UNNAMED] = {
        init: function() {
          this.jsonInit(json);
        }
      };
    } else if (format == 'JavaScript') {
      try {
        eval(code);
      } catch (e) {
        // TODO: Display error in the UI
        console.error("Error while evaluating JavaScript formatted block definition", e);
        return;
      }
    }

    // Look for a block on Blockly.Blocks that does not match the backup.
    var blockType = null;
    for (var type in Blockly.Blocks) {
      if (typeof Blockly.Blocks[type].init == 'function' &&
          Blockly.Blocks[type] != backupBlocks[type]) {
        blockType = type;
        break;
      }
    }
    if (!blockType) {
      return;
    }

    // Create the preview block.
    var previewBlock = BlockFactory.previewWorkspace.newBlock(blockType);
    previewBlock.initSvg();
    previewBlock.render();
    previewBlock.setMovable(false);
    previewBlock.setDeletable(false);
    previewBlock.moveBy(15, 10);
    BlockFactory.previewWorkspace.clearUndo();
    BlockFactory.updateGenerator(previewBlock);

    // Warn user only if their block type is already exists in Blockly's
    // standard library.
    var rootBlock = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
    if (StandardCategories.coreBlockTypes.indexOf(blockType) != -1) {
      rootBlock.setWarningText('A core Blockly block already exists ' +
          'under this name.');

    } else if (blockType == 'block_type') {
      // Warn user to let them know they can't save a block under the default
      // name 'block_type'
      rootBlock.setWarningText('You cannot save a block with the default ' +
          'name, "block_type"');

    } else {
      rootBlock.setWarningText(null);
    }
  } catch(err) {
    // TODO: Show error on the UI
    console.log(err);
    BlockFactory.updateBlocksFlag = false
    BlockFactory.updateBlocksFlagDelayed = false
  } finally {
    Blockly.Blocks = backupBlocks;
  }
};

/**
 * Gets the format from the Block Definitions' format selector/drop-down.
 * @return Either 'JavaScript' or 'JSON'.
 * @throws If selector value is not recognized.
 */
BlockFactory.getBlockDefinitionFormat = function() {
  switch (document.getElementById('format').value) {
    case 'JSON':
    case 'Manual-JSON':
      return 'JSON';

    case 'JavaScript':
    case 'Manual-JS':
      return 'JavaScript';

    default:
      throw 'Unknown format: ' + format;
  }
}

/**
 * Disable link and save buttons if the format is 'Manual', enable otherwise.
 */
BlockFactory.disableEnableLink = function() {
  var linkButton = document.getElementById('linkButton');
  var saveBlockButton = document.getElementById('localSaveButton');
  var saveToLibButton = document.getElementById('saveToBlockLibraryButton');
  var disabled = document.getElementById('format').value.substr(0, 6) == 'Manual';
  linkButton.disabled = disabled;
  saveBlockButton.disabled = disabled;
  saveToLibButton.disabled = disabled;
};

/**
 * Render starter block (factory_base).
 */
BlockFactory.showStarterBlock = function() {
  BlockFactory.mainWorkspace.clear();
  var xml = Blockly.Xml.textToDom(BlockFactory.STARTER_BLOCK_XML_TEXT);
  console.log(xml);
  Blockly.Xml.domToWorkspace(xml, BlockFactory.mainWorkspace);
};

/**
 * Returns whether or not the current block open is the starter block.
 */
BlockFactory.isStarterBlock = function() {
  var rootBlock = FactoryUtils.getRootBlock(BlockFactory.mainWorkspace);
  return rootBlock && !(
      // The starter block does not have blocks nested into the factory_base block.
      rootBlock.getChildren().length > 0 ||
      // The starter block's name is the default, 'block_type'.
      rootBlock.getFieldValue('NAME').trim().toLowerCase() != 'block_type' ||
      // The starter block has no connections.
      rootBlock.getFieldValue('CONNECTIONS') != 'NONE' ||
      // The starter block has automatic inputs.
      rootBlock.getFieldValue('INLINE') != 'AUTO'
      );
};

/**
 * Updates blocks from the manually edited js or json from their text area.
 */
BlockFactory.manualEdit = function() {
  // TODO(#1267): Replace these global state flags with parameters passed to
  //              the right functions.
  BlockFactory.updateBlocksFlag = true;
  BlockFactory.updateBlocksFlagDelayed = true;
  BlockFactory.updateLanguage();
}

export default BlockFactory;