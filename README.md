
# Visitor Management Section

It's short-handly known as the VMS application. It consists of both a website and App.
The app is developed in FLUTTER and REACT NATIVE.
Website is developed in HTML, CSS, JS , CSS, JQUERY and AJAX calls.

Backend used Node.js and MongoDB.

It is the application where the employee and visitor can schedule meetings between them in the BUSY companies.

so you may have doubts about the use of the application?

Here is the answer, First the visitor comes to the company, there will be the TABLET/IPAD placed at the reception table,
he/she can go there and enter their mobile number and complete the OTP and selfie verification process, they were just 2 min steps.
Now, the employee list available in the company is shown to a visitor respective to their designation and department where the employee is working.
Now, the visitor selects an employee and schedules the meeting.

Here, I used socket.io and firebase, whenever as soon a visitor schedules a meeting,
There will be a separate employee app on the EMPLOYEE mobile, he will get the notification and caller screen with three options whether to accept, reject and reschedule the meeting,
If the employee didn't respond for one minute, then the meeting will be deleted and he can place the meeting again.

Once the meeting was done between them, the employee will update the meeting status as completed from their mobile and it will be updated in the database.

There will be 4 roles here:

1. Super Admin
2. Admin
3. Employee
4. Visitor

Super Admin have the access to create different companies and credentials for them and give the license expiry date to them.
simply we can tell this as he/she can rotate and give access to different companies.

Admin will be the owner of the company. He has the access to the analysed dashboard. He can see how the meetings were going, and how many are accepted, rejected or rescheduled.

Detailed analysis with dates and charts will be shown.

Where visitor and Employee are the two apps, where they can respond and schedule meetings.

A major upgrade is going on, its under development mode, the feature included in this is, now the company can select the QR flow,
where there will be no requirement for mobile, the same process occurs,
The user scans the QRCODE and it will redirect to the web flow process.

for a Detailed presentation contact me!

## Demo

link to demo
https://vms.webwizard.in


## Installation
Please check the versions of yours and project from package.json before running, Because version mismatches may cause deprecated modules not work properly.
        
Run UI folder normally as you run html and js projects.

Run Backend folder with npm as

```bash
  cd backend
  npm install //for installing node_modules
  node server.js
```
    
    
## 🛠 Skills
Javascript, HTML, CSS, Jquery, Ajax, Node js, MongoDB, Firebase


## Environment Variables

To run this project, you will need to add the following environment variables to your .env file in the backend only

```
PORT = <Your preffered port>
URL = <Your url to mongodb>
SECRETS = <Secret key for JWT authentication>
MSG91_AUTHKEY = <It's optional you can check and remove code related to msg91.>
MSG91_TEMPLATEID = <Template id from msg91>
FRONTEND_URL= <Frontend applciation URL>
FIREBASE_DATABASE_URL = <Firebase database url>
FIREBASE_STORAGE_BUCKET = <Firebase storage bucker>
```



![Logo](https://vms.webwizard.in/logo_border.png)


## Features

- Qr code work flow
- Live to Live Notifications
- Messages alert



## Appendix

Any additional information goes here

I used MSG91 service here to send the Messages to visitor whenever the employee accepts,rejects or rechedules the meeting, Also
MSG91 is used for OTP verification to send message during new Visitor login.

## Lessons Learned

What did you learn while building this project? What challenges did you face and how did you overcome them?

Major problem is to integrate all frontend, backend and Database efficiently. Because all of the three run on different domains and different languages used.

CORS is the major issues while using http-only cookies and secured jwt authentication.

Integrating MSG91 caused little problem with backend.
## Run Locally

Clone the project

```bash
  git clone https://github.com/sunilpasupuleti/visitor-management-system.git
```

To run backend Go to the project directory

```bash
  cd backend
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  node server.js
```

For running frontend, You dont need any commands, its just a normal html, js, css, jquery and ajax files


## Screenshots

![App Screenshot](https://vms.webwizard.in/screenshots/1.png)


![App Screenshot](https://vms.webwizard.in/screenshots/2.png)


![App Screenshot](https://vms.webwizard.in/screenshots/3.png)


![App Screenshot](https://vms.webwizard.in/screenshots/4.png)


![App Screenshot](https://vms.webwizard.in/screenshots/5.png)


![App Screenshot](https://vms.webwizard.in/screenshots/6.png)


![App Screenshot](https://vms.webwizard.in/screenshots/7.png)


![App Screenshot](https://vms.webwizard.in/screenshots/8.png)


![App Screenshot](https://vms.webwizard.in/screenshots/9.png)



