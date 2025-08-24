const { addNotification } = require("../modules/Notification/notification.service");

const sendNotification = async (data, roomId) => {
  const notification = await addNotification(data);
  if(notification){
    io.emit(roomId, notification);
    console.log('---> Notification sent to room: ', roomId)
  }
  return true;
}

module.exports = sendNotification;