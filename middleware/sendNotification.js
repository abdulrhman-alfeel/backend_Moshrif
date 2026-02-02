const { firebase } = require("../firebase/indexfirebase");

let notificationPayload = {
  roomId: 1,
  roomName: "التاكسيات",
  receiverIds: "عبدالرحمن",
  type: "رسائل",
};

// const androidConfig = {
//   notification: {
//     icon: 'ic_launcher_round', // Ensure this is a valid drawable resource
//     image: 'https://storage.googleapis.com/demo_backendmoshrif_bucket-2/Vector.png',
//   },
// };

// const apnsConfig = {
//   payload: {
//     aps: {
//       'mutable-content': 1,
//     },
//     image: 'https://storage.googleapis.com/demo_backendmoshrif_bucket-2/Vector.png',
//   },
// };

async function massges(
  tokens,
  notification,
  notification_type,
  navigationId,
  data
) {
  // console.log(tokens);
  // let res = await firebase.messaging().sendEachForMulticast({
  //   tokens: tokens,
  //   notification: notification,
  //   // android: androidConfig,
  //   // apns: apnsConfig,

  //   data: {
  //     notification_type: notification_type,
  //     navigationId: navigationId,
  //     data: JSON.stringify(data),
  //   },
  // });

  // res.responses.forEach((resp, index) => {
  //   if (!resp.success) {
  //     console.error(`Error sending to token ${tokens[index]}:`, resp.error);
  //   }
  // });
  // console.log(res);
}

module.exports = { massges };
