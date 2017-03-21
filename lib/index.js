'use strict';

const BbPromise = require('bluebird');
const EmailTemplate = require('email-templates').EmailTemplate;
const mg = require('nodemailer-mailgun-transport');
const nodemailer = require('nodemailer');
const path = require('path');

class Mailer {
  constructor(event) {
    this.emailRegex
      = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    this.templatesDir = './templates/';
    this.emailService = process.env.EMAIL_SERVICE;
    this.emailServiceUser = process.env.EMAIL_SERVICE_USER;
    this.emailServicePass = process.env.EMAIL_SERVICE_PASS;
    this.event = event;

    return this;
  }

  validate() {
    // if (!this.emailService) return BbPromise.reject('EMAIL_SERVICE env var not set');
    // if (!this.emailServiceUser) return BbPromise.reject('EMAIL_SERVICE_USER env var not set');
    // if (!this.emailServicePass) return BbPromise.reject('EMAIL_SERVICE_PASS env var not set');
    //if (!this.emailRegex.test(this.event.from) || !this.emailRegex.test(this.event.to)) {
      //return BbPromise.reject('Please provide valid email addresses.');
    //}
  }

  render() {
    console.log(this.event)
    const templateDirPath = path.join(__dirname, this.templatesDir, this.event.template);

    const template = new EmailTemplate(templateDirPath);
    BbPromise.promisifyAll(template);
    return template.render(this.event.context);
  }

  send(renderResult) {
    const transporter = nodemailer.createTransport(mg({
      auth: {
        //user: this.emailServiceUser,
        //pass: this.emailServicePass,
        api_key: process.env.EMAIL_SERVICE_API_KEY,
        domain: process.env.EMAIL_SERVICE_DOMAIN,
      },
    }));

    BbPromise.promisifyAll(transporter);

    this.event.text = renderResult.text;
    this.event.html = renderResult.html;

    return transporter.sendMailAsync(this.event)
      .then((info) => {
        console.log(`Message sent:  ${JSON.stringify(info)}`);
        return BbPromise.resolve(info.response);
      });
  }
}

module.exports = Mailer;
