// var NotificationReqData = {
//   adminId: localStorage.getItem("adminId"),
//   pageNumber: 0,
// };

// function getDate(currentDate) {
//   // console.log("currentDate--",currentDate)
//   let date = new Date(currentDate);
//   let time = date.toLocaleTimeString([], {
//     hour12: true,
//     hour: "2-digit",
//     minute: "2-digit",
//   });
//   let completeDate = `${date.getMonth()+1}/${date.getDate()}/${date.getFullYear()} ,${time} `;
//   return completeDate;
// }

// function getNotifications(NotificationReqData) {
//   fetch("https://api.notarizetech.com/admin/common/getUnreadNotifications", {
//       method: "POST",
//       body: JSON.stringify(NotificationReqData),
//       headers: {
//         "Content-Type": "application/json;charset=UTF-8",
//         "Authorization": "Bearer " + localStorage.getItem("token")

//       },
//     })
//     .then((response) => {
//       return response.json();
//     })
//     .then((response) => {
//       if (!response.status) {
//         swal({
//           title: "Oops",
//           text: `${response.message}`,
//           type: "error",
//           icon: "error"
//         });
//       }
//       updateNotification(response);
//       hideMiniLoader();
//     })
//     .catch((err) => {
//       swal({
//         title: "Oops",
//         text: `Error in fetching Data Refresh Page`,
//         type: "error",
//         icon: "error"
//       }).then(()=>window.location.reload())
//     })
// }
// getNotifications(NotificationReqData);
// $(".notification-page-buttons").on("click", (e) => {
//   document.body.scrollTop = 0;
//   document.documentElement.scrollTop = 0;
//   e.stopPropagation();
// });

// function updateNotification(response) {
//   const {
//     notifications,
//     pageCount,
//     totalNotifications
//   } = response;
//   let notificationContainer = $(".notification-list-group");
//   if ((totalNotifications==0 || totalNotifications==null)) {
//     $(".num-of-notifications").html(totalNotifications);
//     notificationContainer.html(`<b class="mx-auto my-2"> No Notification</b>`);
//     let notificationPageButton = $(".notification-page-buttons");
//     notificationPageButton.hide();
//   } else {
//     notifications.forEach((notification) => {
//       const {
//         message,
//         timestamp
//       } = notification;
//       let userNotification = `
//         <div class="list-group-item list-group-item-action">
//           <div class="row align-items-center">
            
//             <div class="col ml--2">
//               <div class="d-flex justify-content-between align-items-center">
//                 <div>
//                   <h4 class="mb-0 text-sm">${message}</h4>
//                 </div>
//                 <div class="text-right text-muted">
//                   <small>${getDate(timestamp)}</small>
//                 </div>
//               </div>
             
//             </div>
//           </div>
//         </div>
//         `;

//       notificationContainer.append(userNotification);
//     });
//   }
//   $(".num-of-notifications").html(totalNotifications);
//   getNotificationPageButtons(pageCount, notificationContainer);
// }

// function getNotificationPageButtons(pageCount, notificationContainer) {
//   let notificationPageButton = $(".notification-page-buttons");

//   notificationPageButton.empty();

//   var previous_page_button = `
//               <button class='btn btn-sm btn-primary previous-page-btn ' disabled>  
//                   <i class='fas fa-angle-left'></i>
//               </button>`;
//   notificationPageButton.append(previous_page_button);

//   var next_page_button = `
//           <button class='btn btn-sm btn-primary next-page-btn' >  
//             <i class='fas fa-angle-right'></i>
//           </button>`;

//   for (let index = 1; index <= pageCount; index++) {
//     let pageNumberButtons = ` 
//           <button class="btn btn-sm btn-outline-primary page-button-number "      value=${index}>
//             ${index}
//           </button>`;
//     notificationPageButton.append(pageNumberButtons);
//   }

//   notificationPageButton.append(next_page_button);

//   if (NotificationReqData.pageNumber != 0) {
//     $(".previous-page-btn").attr("disabled", false);
//   }
//   if (NotificationReqData.pageNumber == 0) {
//     $(".next-page-btn").attr("disabled", false);
//   }
//   if (NotificationReqData.pageNumber == pageCount - 1) {
//     $(".next-page-btn").attr("disabled", true);
//   }

//   $(".page-button-number").on("click", (e) => {
//     notificationContainer.empty();
//     showMiniLoader();
//     var currentPageNumber = e.target.innerText;
//     $(this).addClass("active");
//     NotificationReqData.pageNumber = parseInt(currentPageNumber, 10) - 1;
//     getNotifications(NotificationReqData);
//   });

//   $(".next-page-btn").on("click", () => {
//     notificationContainer;
//     showMiniLoader();

//     if (NotificationReqData.pageNumber != 1) {
//       $(".previous-page-btn").attr("disabled", false);
//     }

//     NotificationReqData.pageNumber =
//       parseInt(NotificationReqData.pageNumber, 10) + 1;
//     getNotifications(NotificationReqData);
//   });

//   $(".previous-page-btn").on("click", () => {
//     notificationContainer;
//     showMiniLoader();
//     if (NotificationReqData.pageNumber == 1) {
//       $(".previous-page-btn").attr("disabled", true);
//     }
//     NotificationReqData.pageNumber =
//       parseInt(NotificationReqData.pageNumber, 10) - 1;
//     getNotifications(NotificationReqData);
//   });
// }