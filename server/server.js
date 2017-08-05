const botBuilder = require('botbuilder');

const restify = require('restify');

//var connector = new botBuilder.ConsoleConnector().listen();

const curatedContentRepoAccess = require('./../curatedContentRepo/curatedContentRepoAccess.js');

var connector = new botBuilder.ChatConnector({
  appId: '9c1c33de-b881-4e7d-aba2-d006d90d225f',
  appPassword: 'HFTYtEdbibOgSEaM0P0a2sE'
});

var bot = new botBuilder.UniversalBot(connector);


bot.on('conversationUpdate', function (message) {
    if (message.membersAdded) {
        message.membersAdded.forEach(function (identity) {
            if (identity.id === message.address.bot.id) {
                bot.beginDialog(message.address, '/');
            }
        });
    }
});

//waterfall model -- where one function is calling the other and passing down the results
bot.dialog('/',[
    function(session){
        session.send('Welcome to byte sized learning an experimental approach to learning small bytes of curated content at your own pace. You can get more details around this concept by visiting this web page. In order you to get kick started we require a few details');
        session.beginDialog('/askEmailId');
    },
    function(session,results){
        session.beginDialog('/restartDialogue');
    }
]);

bot.dialog('/restartDialogue',[
    function(session){
        session.beginDialog('/askOption');
    },
    function(session,results){

        curatedContentRepoAccess.recordLog(session.userData.userName,session.userData.enrolledModule,(err, pretrievedContent) =>
        {
        });

        session.beginDialog('/byteSizedLearning');
    }
]);


bot.dialog('/askEmailId', [
    function (session) {
        botBuilder.Prompts.text(session, 'Please share your email id so that your progress can be tracked?');
    },
    function (session, results) {
        session.userData.userName = results.response;
        session.endDialogWithResult(results);
    }
]);

bot.dialog('/askFeedback', [
    function (session) {
        session.send(`Congrats!!! You are done with ${session.userData.enrolledModule},It will be great if you can share your feedback on the module`);
        botBuilder.Prompts.choice(session, 'How would you rate the content between 1 and 5 where 5 being the best','1|2|3|4|5');
    },
    function (session, results) {
        session.userData.feedbackOnContent = results.response.entity;
        botBuilder.Prompts.choice(session, 'How would you rate your experience of the platform between 1 and 5 where 5 being the best','1|2|3|4|5');

    },
    function(session,results){
        session.userData.feedbackOnExperience = results.response.entity;

        curatedContentRepoAccess.recordFeedback(session.userData.userName,session.userData.enrolledModule,session.userData.feedbackOnContent,session.userData.feedbackOnExperience,(err, pretrievedContent) =>
        {
            session.send('Thanks a TON for your feedback');
            session.replaceDialog('/askQuit');
        });
    },
]);

bot.dialog('/askQuit', [
    function (session) {
        botBuilder.Prompts.choice(session, 'Do you want to take a break','yes|no');
    },
    function (session, results) {
        if (results.response.entity === "yes"){
            session.endConversation('Thanks for using the bot, Hope you had a great learning');
        } else {
            session.replaceDialog('/restartDialogue');
        }
    }
]);

bot.dialog('/askOption', [
    function (session) {
        curatedContentRepoAccess.getAllSubjectAreas((err, pretrievedContent) =>
        {
            botBuilder.Prompts.choice(session, 'What would you like to explore today?',pretrievedContent);
        });
    },
    function (session,results) {
        session.userData.enrolledModulePrimary = results.response.entity;
        curatedContentRepoAccess.getFilteredSubjectAreas(session.userData.enrolledModulePrimary,(err, pretrievedContent) =>
        {
            session.send('Here is the decider, a few more options for your learning');
            botBuilder.Prompts.choice(session, `What would you like to explore within ${session.userData.enrolledModulePrimary}?`,pretrievedContent);
        });
    },
    function (session, results) {
        session.userData.enrolledModule = results.response.entity;
        curatedContentRepoAccess.getUserEnrolledModuleData(session.userData.userName,session.userData.enrolledModule,(err, pretrievedContent) =>
        {
            if(!err){
                session.userData.knowledgeStep = pretrievedContent.learningStep.toString();
                session.endDialogWithResult(results);
            }
            else {
                curatedContentRepoAccess.insertProgress(session.userData.userName,session.userData.enrolledModule,(err, pretrievedContent) =>
                {
                    if (!err)
                        {
                             session.endDialogWithResult(results);
                        }
                });
            }
        });
    }
]);

bot.dialog('/byteSizedLearning',[
    function(session, args) {
        if(session.message.text === "quit") {
            session.endConversation('Hope you had fun time learning. Looking forward to see you soon');
        }
        else if(session.message.text === "help") {
            session.send('Here is the list of commands that you can use for navigation\n 1) key in "quit" to close the conversation \n 2) key in "next" to move forward');
        }
        else
        {
            curatedContentRepoAccess.getCuratedContent(session.userData.knowledgeStep,session.userData.enrolledModule,(err, pretrievedContent) =>
            {
                var knowledgeStep = parseInt(session.userData.knowledgeStep);

                curatedContentRepoAccess.updatePoints(session.userData.userName,0,(err, pretrievedContent) =>
                {
                });

                if(!err){
                    var contentType = pretrievedContent.contentType.toString();
                    var contentOptions = pretrievedContent.contentOptions;
                    var filtContentOptions = contentOptions.filter(value => Object.keys(value).length !== 0);

                    session.userData.contentType = contentType;

                    if (contentType === "TextContent"){

                        session.userData.correctOption = "Undefined";
                        botBuilder.Prompts.text(session, pretrievedContent.contentDescription);

                    } else if (contentType === "MediaContent") {

                        var msg = session.message;
                        session.send({
                            text: pretrievedContent.contentDescription,
                            attachments: [{
                                name: "Click Here for the Video",
                                contentUrl: pretrievedContent.contentURL
                            }
                            ]
                        });

                        // var card =  new botBuilder.VideoCard(session)
                        // .title(pretrievedContent.contentDescription)
                        // .media([{ url: pretrievedContent.contentURL }])
                        // .image([{}])
                        // .buttons([botBuilder.CardAction.openUrl(session, pretrievedContent.contentURL, 'Full Screen')]);
                        // var msg = new botBuilder.Message(session).addAttachment(card);       
                        
                        // session.send(msg);                           

                        knowledgeStep = knowledgeStep + 1;
                        session.userData.knowledgeStep =knowledgeStep;    
                        

                        curatedContentRepoAccess.updateProgress(session.userData.userName,session.userData.enrolledModule,session.userData.knowledgeStep,0,(err, pretrievedContent) =>
                        {
                        });  
                        

                    } else if (contentType === "VideoContent") {


                        var card =  new botBuilder.VideoCard(session)
                        .title(pretrievedContent.contentDescription)
                        .media([{ url: pretrievedContent.contentURL }])
                        .image([{}])
                        .buttons([botBuilder.CardAction.openUrl(session, pretrievedContent.contentURL, 'Full Screen')]);
                        var msg = new botBuilder.Message(session).addAttachment(card);

                        session.send(msg);

                        knowledgeStep = knowledgeStep + 1;
                        session.userData.knowledgeStep =knowledgeStep;


                        curatedContentRepoAccess.updateProgress(session.userData.userName,session.userData.enrolledModule,session.userData.knowledgeStep,0,(err, pretrievedContent) =>
                        {
                        });


                    } else if (contentType === "ImageContent") {

                        var card =  new botBuilder.ThumbnailCard(session)
                        .text(pretrievedContent.contentDescription)
                        .images([botBuilder.CardImage.create(session,pretrievedContent.contentURL)])
                        .buttons([botBuilder.CardAction.openUrl(session, pretrievedContent.contentURL, 'View Image -- Full Screen')]);
                        var msg = new botBuilder.Message(session).addAttachment(card);

                        session.send(msg);

                        knowledgeStep = knowledgeStep + 1;
                        session.userData.knowledgeStep =knowledgeStep;

                        curatedContentRepoAccess.updateProgress(session.userData.userName,session.userData.enrolledModule,session.userData.knowledgeStep,0,(err, pretrievedContent) =>
                        {
                        });


                    } else if (contentType === "MixedContent") {

                        var card =  new botBuilder.HeroCard(session)
                        .text(pretrievedContent.contentDescription)
                        .buttons([botBuilder.CardAction.openUrl(session, pretrievedContent.contentURL, 'Full Screen')]);
                        var msg = new botBuilder.Message(session).addAttachment(card);
                        session.send(msg);

                        knowledgeStep = knowledgeStep + 1;
                        session.userData.knowledgeStep =knowledgeStep;

                        curatedContentRepoAccess.updateProgress(session.userData.userName,session.userData.enrolledModule,session.userData.knowledgeStep,0,(err, pretrievedContent) =>
                        {
                        });

                    } else if (contentType === "Inquiry"){

                        session.userData.correctOption = pretrievedContent.correctOption.toString();
                        botBuilder.Prompts.choice(session, pretrievedContent.contentDescription, filtContentOptions);

                    }
                } else {
                    session.replaceDialog('/askFeedback');
                }
            });
        }
    },
    function(session, results) {

        var userResponse = results.response.toString();
        var selectedOption = results.response.entity;
        var knowledgeStep = parseInt(session.userData.knowledgeStep);
        var contentType = session.userData.contentType;

        if (userResponse === "quit") {

            session.endConversation('Hope you had fun time learning. Looking forward to see you soon');

        } else if (userResponse === "next") {

            knowledgeStep = knowledgeStep + 1;
            session.userData.knowledgeStep =knowledgeStep;

            session.replaceDialog('/byteSizedLearning');

        }  else if (contentType === 'Inquiry'  && selectedOption === session.userData.correctOption) {

            knowledgeStep = knowledgeStep + 1;
            session.userData.knowledgeStep =knowledgeStep;

            session.send("Congrats!!!, you got it right");

            curatedContentRepoAccess.updateProgress(session.userData.userName,session.userData.enrolledModule,session.userData.knowledgeStep,0,(err, pretrievedContent) =>
            {
            });

            curatedContentRepoAccess.updatePoints(session.userData.userName,50,(err, pretrievedContent) =>
            {
            });

            session.replaceDialog('/byteSizedLearning');



        } else if (contentType === 'Inquiry'  && !(selectedOption === session.userData.correctOption))  {

            knowledgeStep = knowledgeStep + 1;
            session.userData.knowledgeStep =knowledgeStep;

            session.send(`Sorry the right answer is ${session.userData.correctOption}`);
            session.replaceDialog('/byteSizedLearning');

        }
    }
]);

// bot.dialog('/',[
//     (session) => {


//         curatedContentRepoAccess.getCuratedContent(2,"machinelearning",(err, pretrievedContent) =>
//         {
//             if(!err){
//                 botBuilder.Prompts.text(session, pretrievedContent.contentData);
//             }
//         });

//         curatedContentRepoAccess.getCuratedContent(1,"machinelearning",(err, pretrievedContent) =>
//         {
//             if(!err){
//                 botBuilder.Prompts.text(session, pretrievedContent.contentData);
//             }
//         });
//         //botBuilder.Prompts.text(session, 'Please enter your name');

//     },
//     (session, result) => {
//             session.send(`You said ${result.response}`);
//     }
// ]);

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`${server.name} listening to ${server.url}`);
});

server.post('/api/messages', connector.listen());
