'use strict';

const sortCategory = (toolbox) => {
  const order = [
    'Logic',
    'Control',
    'Math',
    'Text',
    'Variables',
    'Functions',
    'IO',
    'Time',
    'Audio',
    'Motors',
    'Comms',
    'DHT',
    'User'
  ];

  const sorted = toolbox.sort(function (a, b) {
    return order.indexOf(a[0]) - order.indexOf(b[0]);
  });
  return sorted;
};

// get all the blocks for an activity
module.exports.findByActivity = async (id) => {
  // get the target activity
  const activity = await strapi.services.activity.findOne({ id }, [
    'blocks.blocks_category',
  ]);

  // return the blocks only if the activity is found
  return activity ? activity.blocks : undefined;
};

// get all the blocks for a cc workspace
module.exports.findByWorkspace = async (id) => {
  // get the target activity
  const workspace = await strapi.services['authorized-workspace'].findOne({ id }, [
    'blocks.blocks_category',
  ]);

  // return the blocks only if the activity is found
  return workspace ? workspace.blocks : undefined;
};

// create a blockly friendly toolbox from blocks
module.exports.blocksToToolbox = (blocks) => {
  let toolbox = {};
  blocks.forEach((block) => {
    // validate the block fields
    const { blocks_category, name, description, image_url } = block;
    if (!blocks_category) return;

    // only take the required fields from the block
    let sanitizedBlock = { name, description, image_url };

    // append the block to an existing category
    // else create a new category
    if (toolbox[blocks_category.name]) {
      toolbox[blocks_category.name].push(sanitizedBlock);
    } else {
      toolbox[blocks_category.name] = [sanitizedBlock];
    }
  });
  const arr = Object.entries(toolbox);

  return sortCategory(arr);
};
