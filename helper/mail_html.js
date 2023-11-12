const mailHtml = (data, link, text) => {
    console.log(data,"=================================")
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Hot Date Couple Matching!</title>
            <style>
                /* Add your custom CSS styles here */
                body {
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                    background-color:#333333;
                }
                .container {
                    max-width: 600px;
                    margin: 30px auto;
                    background-color: #FFFFFF;
                    border: 1px solid #ccc;
                    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                    background-color: #F79220;
                }
                .header h1 {
                    color: #FFFFFF;
                }
                .content {
                    padding: 20px;
                }
                .button-container {
                    text-align: center;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #F79220;
                    color: #FFFFFF;
                    text-decoration: none;
                }
                .footer {
                    text-align: center;
                    padding: 10px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
            <div class="header">
            <h1>Welcome to Hot Date App!</h1>
        </div>
                <div class="content">
                    <p><h4>Hello ${data.name},</h4></p>
                    <p>${text}</p>
                    <p><h4>Your registration details:</h4></p>
                    <ul>
                        <li><strong>Name:</strong> ${data.name}</li>
                        <li><strong>Email:</strong> ${data.email}</li>
                    </ul>
                    <p><h4>We look forward to helping you find your perfect match. Get started by completing your profile and exploring potential matches on our platform.</h4></p>
                    <p><h4>If you have any questions or need assistance, feel free to contact our support team.</h4></p>
                    <div class="button-container">
                        <a class="button" href=${link} target="_blank">Verify Email</a>
                    </div>
                </div>
                <div class="footer">
                    <p>&copy; 2023 Hot Date Couple. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>`;
}
const forgetMail =(name,OTP)=>{
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to Hot Date Couple Matching!</title>
      <style>
          /* Add your custom CSS styles here */
          body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background-color: #333333;
          }
          .container {
              max-width: 600px;
              margin: 30px auto;
              background-color: #FFFFFF;
              border: 1px solid #ccc;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
          }
          .header {
              text-align: center;
              padding: 20px 0;
              background-color: #F79220;
          }
          .header h1 {
              color: #FFFFFF;
          }
          .content {
              padding: 20px;
          }
          .button-container {
              text-align: center;
          }
          .button {
              display: inline-block;
              padding: 10px 20px;
              background-color: #F79220;
              color: #FFFFFF;
              text-decoration: none;
          }
          .footer {
              text-align: center;
              padding: 10px 0;
          }
      </style>
  </head>
  <body>
      <div class="container">
      <div class="header">
      <h1>Welcome to Hot Date App!</h1>
  </div>
          <div class="content">
              <h1>Password Reset OTP</h1>
              <p><h4>Hello ${name},</h4></p>
              <p><h4>Your requested OTP for password reset is:</h4></p>
              <h2>${OTP}</h2>
              <p><h4>This OTP is valid for a limited time. Please use it to reset your password.</h4></p>
              <p><h4>If you didn't request this OTP, please ignore this email.</h4></p>
              <p>Best regards,<br>https://hot-date.vercel.app/</p>
              </div>`
}
const change_passMail = (title , name ,text)=>{
return `<!DOCTYPE html>
 <html lang="en">
 <head>
     <meta charset="UTF-8">
     <meta name="viewport" content="width=device-width, initial-scale=1.0">
     <title>Welcome to Hot Date Couple Matching!</title>
     <style>
         /* Add your custom CSS styles here */
         body {
             font-family: Arial, sans-serif;
             margin: 0;
             padding: 0;
             background-color:#333333;
         }
         .container {
            max-width: 600px;
            margin: 30px auto;
            border: 1px solid #ccc; /* Add a border around the container */
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
         }
         .header {
             text-align: center;
             padding: 20px 0;
             background-color: #F79220;
         }
         .header h1 {
             color: #FFFFFF;
         }
         .content {
             padding: 20px;
         }
         .button-container {
             text-align: center;
         }
         .button {
             display: inline-block;
             padding: 10px 20px;
             background-color: #F79220;
             color: #FFFFFF;
             text-decoration: none;
         }
         .footer {
             text-align: center;
             padding: 10px 0;
         }
     </style>
 </head>
 <body>
     <div class="container">
     <div class="header">
     <!-- Check the image source URL and make sure it's correct -->
     <h1>Welcome to Hot Date App!</h1>
 </div>
         <div class="content">
         <h1>${title}</h1>
         <p><h4>Hello ${name},</h4></p>
         <p><h4>${text}</h4></p>
         <p>Best regards,<br>https://hot-date.vercel.app/</p>
         </div>
         `
         
}
module.exports = {
    mailHtml,
forgetMail,
change_passMail
}