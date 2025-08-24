const StaticContent = require('./staticContent.model');

const addStaticContent = async (staticContentBody) => {
  var staticContent = await findStaticContent(staticContentBody.type);
  if (staticContent) {
    staticContent.content = staticContentBody.content;
  }
  else {
    staticContent = new StaticContent(staticContentBody);
  }
  await staticContent.save();
  return staticContent;
}

const findStaticContent = async (type) => {
  const staticContent = await StaticContent.findOne({ type });
  return staticContent;
}

const getStaticContent = async (type) => {
  return await StaticContent.findOne({ type }).select('content');
}

module.exports = {
  addStaticContent,
  getStaticContent
}
