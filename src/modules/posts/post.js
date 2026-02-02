const {
  SELECTCOUNTCOMMENTANDLIKPOST,
  SELECTTableLikesPostPublicotherroad,
  SELECTTableCommentPostPublic,
  SELECTTablePostPublicSearch,
  SELECTTablePostPublicOneObject,
  SELECTTablecompanySub,
  SELECTTablepostAll,
} = require("../../../sql/selected/selected");
const {
  SELECTusersCompany,
} = require("../../../sql/selected/selectuser");

const BringPost = () => {
  return async (req, res) => {
    try {
      const { CompanyID, PostID, user } = req.query;

      const now = new Date();
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("In,valid session");
      }

      // Extract day, month, and year from the Date object
      const day = String(now.getUTCDate()).padStart(2, "0"); // Day of the month (01 to 31)
      const month = String(now.getUTCMonth() + 1).padStart(2, "0"); // Month (01 to 12)
      const year = String(now.getUTCFullYear()).slice(); // Last two digits of the year

      // Format the date as "DD-MM-YY"
      const formattedDate = `${year}-${month}-${day}`;

      const arrayPosts = await BringPostforEmploaysCompany(
        CompanyID,
        formattedDate,
        PostID,
        userSession.userName,
        userSession.jobdiscrption,
        userSession.PhoneNumber
      );
      res.send({ success: "تمت العملية بنجاح", data: arrayPosts }).status(200);
      // console.log(arrayPosts);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(404);
    }
  };
};

const BringCommentinsert = () => {
  return async (req, res) => {
    try {
      const { PostID, count } = req.query;
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      const result = await SELECTTableCommentPostPublic(PostID, count);
      let arraynew = [];
      for (let index = 0; index < result.length; index++) {
        const element = result[index];
        const user = await SELECTusersCompany(
          element?.userName,
          userSession?.IDCompany
        );
        let data = {
          ...element,
          job: user?.job ?? "",
        };
        arraynew.push(data);
      }
      res.send({ success: "تمت العملية بنجاح", data: arraynew }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ المهمة" }).status(404);
    }
  };
};

// وظيفة جلب المنشورات لاعضاء الشركة
const BringPostforEmploaysCompany = async (
  id,
  formattedDate,
  PostID,
  user,
  userJob = "",
  PhoneNumber
) => {
  try {
    const result = await SELECTTablepostAll(
      id,
      formattedDate,
      PostID,
      user,
      userJob,
      PhoneNumber
    );
    // تحويل UserLiked من عدد إلى قيمة منطقية
    const arrayPosts = result.map((element) => ({
      ...element,
      Likeuser: element.UserLiked > 0,
      Comment: element.Comment,
      Likes: element.Likes,
    }));
    return arrayPosts;
  } catch (error) {
    console.log(error);
  }
};

// const BringPostforEmploaysCompany =async (id, formattedDate, PostID,user,where ="") =>{
//   try{
//     const result = await SELECTTablePostPublic(id, formattedDate, PostID,where);
//     let arrayPosts = [];
//     for (let index = 0; index < result.length; index++) {
//       const element = result[index];
//       const Comment = await SELECTCOUNTCOMMENTANDLIKPOST(
//         element.PostID,
//         "Comment"
//       );
//       const Likeuser = await SELECTTableLikesPostPublicotherroad(
//         element.PostID,
//         user
//       );
//       const Likes = await SELECTCOUNTCOMMENTANDLIKPOST(element.PostID, "Likes");

//       let data = {
//         ...element,
//         Likeuser:
//           Likeuser !== false && Likeuser !== undefined ? true : Likeuser,
//         Comment: Comment["COUNT(userName)"],
//         Likes: Likes["COUNT(userName)"],
//       };
//       arrayPosts.push(data);
//     }
//     return arrayPosts;
//   }catch(error){console.log(error)}
// }



const SearchPosts = () => {
  return async (req, res) => {
    try {
      const {
        CompanyID,
        DateStart,
        DateEnd,
        type,
        nameProject,
        userName,
        branch,
        PostID,
        user,
      } = req.query;

      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }

      const result = await SELECTTablePostPublicSearch(
        CompanyID,
        DateStart,
        DateEnd,
        type,
        nameProject,
        userName,
        branch,
        parseInt(PostID),
        userSession.jobdiscrption,
        userSession.userName,
        userSession.PhoneNumber
      );
    
      // let arraynew = [];

      // for (let index = 0; index < result.length; index++) {
      //   const element = result[index];
      //   const Comment = await SELECTCOUNTCOMMENTANDLIKPOST(
      //     element.PostID,
      //     "Comment"
      //   );
      //   const Likeuser = await SELECTTableLikesPostPublicotherroad(
      //     element.PostID,
      //     user
      //   );
      //   const Likes = await SELECTCOUNTCOMMENTANDLIKPOST(
      //     element.PostID,
      //     "Likes"
      //   );
      //   let data = {
      //     ...element,
      //     Likeuser:
      //       Likeuser !== false && Likeuser !== undefined ? true : Likeuser,
      //     Comment: Comment["COUNT(userName)"],
      //     Likes: Likes["COUNT(userName)"],
      //   };
      //   arraynew.push(data);
      // }
      res.send({ success: "تمت العملية بنجاح", data: result }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(404);
    }
  };
};

const BringObjectOnefromPost = () => {
  return async (req, res) => {
    try {
      const PostID = req.query.PostID;

      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      const PostOne = await SELECTTablePostPublicOneObject(PostID);
      const Comment = await SELECTCOUNTCOMMENTANDLIKPOST(PostID, "Comment");
      const Likeuser = await SELECTTableLikesPostPublicotherroad(
        PostID,
        userSession.userName
      );
      const Likes = await SELECTCOUNTCOMMENTANDLIKPOST(PostID, "Likes");

      let data = {
        ...PostOne,
        Likeuser:
          Likeuser !== false && Likeuser !== undefined ? true : Likeuser,
        Comment: Comment["COUNT(userName)"],
        Likes: Likes["COUNT(userName)"],
      };
      res.send({ success: "تمت العملية بنجاح", data: data }).status(200);
    } catch (error) {
      console.log(error);
      res.send({ success: "فشل تنفيذ العملية" }).status(400);
    }
  };
};

const BringDatabrachCompany = () => {
  return async (req, res) => {
    try {
      const userSession = req.session.user;
      if (!userSession) {
        res.status(401).send("Invalid session");
        console.log("Invalid session");
      }
      const result = await SELECTTablecompanySub(
        userSession.IDCompany,
        "id,NameSub AS name"
      );
      res.send({ success: "تمت العملية بنجاح", data: result });
    } catch (error) {
      console.log(error);
    }
  };
};
module.exports = {
  BringPost,
  BringCommentinsert,
  SearchPosts,
  BringObjectOnefromPost,
  BringDatabrachCompany,
};
