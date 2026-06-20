import nodemmailer from "nodemmailer";
const stmpPort = Number(process.env.STMP_PORT?? 465);

export const mailTransporter = nodemmailer.createTransport({
  host:process.env.STMP_PORT,
  port:stmpPort,
  secure:process.env.STMP_SECURE =="TRUE",
  auth:{
    user:process.env.STMP_USER,
    pass:process.env.STMP_PASS,
  },
});

type sendMailOptions ={
  to:string;
  subject:string;
  html:string;
}

export async function sendMail({to,subject,html}:sendMailOptions) {
  if(!process.env.STMP_USER){
    throw new Error("stmp user is not configured");
  }

  return mailTransporter.sendMail({
  from: `"MarketSync" <${process.env.SMTP_USER}>`,
       to,
       subject,
       html,
  });
  
}

