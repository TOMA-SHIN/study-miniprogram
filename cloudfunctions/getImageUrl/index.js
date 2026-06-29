const cloud = require('wx-server-sdk');

cloud.init({
  env: cloud.DYNAMIC_CURRENT_ENV,
});

exports.main = async (event, context) => {
  const { fileIDs } = event;
  
  if (!fileIDs || !Array.isArray(fileIDs) || fileIDs.length === 0) {
    return {
      success: false,
      message: 'fileIDs is required and must be a non-empty array',
    };
  }
  
  if (fileIDs.length > 50) {
    return {
      success: false,
      message: 'fileIDs array length must not exceed 50',
    };
  }
  
  try {
    const result = await cloud.getTempFileURL({
      fileList: fileIDs,
    });
    
    return {
      success: true,
      data: {
        fileList: result.fileList,
      },
    };
  } catch (error) {
    console.error('getTempFileURL error:', error);
    return {
      success: false,
      message: error.message || 'Failed to get temp file URL',
    };
  }
};
