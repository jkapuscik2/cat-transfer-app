const express = require('express')
const cors = require('cors')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const archiver = require('archiver')
const AWS = require('aws-sdk')
const SES = AWS.SES
const S3 = new AWS.S3({region: process.env.REGION})
const {PassThrough} = require('stream')
const uuid = require("uuid")

const app = express()
const router = express.Router()
const archiveS3Prefix = "archives"

app.use(cors())
app.use(express.json({limit: '20mb'}));
app.use(express.urlencoded({limit: '20mb'}));
app.use(awsServerlessExpressMiddleware.eventContext())

const getFileUrl = async name => {
    const params = {
        Bucket: process.env.BUCKET_NAME,
        Key: `${archiveS3Prefix}/${name}`
    }
    try {
        const url = await S3.getSignedUrl("getObject", params)

        return url
    } catch (e) {
        return null
    }
}

router.get('/files/:file', async (req, res) => {
    const fileName = req.params.file
    const fileUrl = await getFileUrl(fileName)

    if (!fileUrl) return res.status(404).json({message: "No such file"})

    res.redirect(fileUrl);
})

const archiveFiles = files => {
    return new Promise(async (resolve, reject) => {
        try {
            const outputStream = new PassThrough()
            const archive = archiver('zip')
            const archiveName = `${uuid.v4()}.zip`

            archive.pipe(outputStream);

            for (let fileIdx = 0; fileIdx < files.length; fileIdx++) {
                const base64Data = new Buffer.from(files[fileIdx]["base64"].replace(/^data:image\/\w+;base64,/, ""), 'base64')
                archive.append(base64Data, {name: files[fileIdx]["name"]})
            }
            archive.finalize()

            const params = {
                Bucket: process.env.BUCKET_NAME,
                Key: `${archiveS3Prefix}/${archiveName}`,
                Body: outputStream,
                ContentType: "application/zip",
                StorageClass: 'ONEZONE_IA'
            }

            S3.upload(params, (error, data) => {
                if (error) {
                    reject(error)
                } else {
                    resolve(archiveName)
                }
            });
        } catch (error) {
            reject(error)
        }
    });
}

const sendEmail = async (emailFrom, emailTo, message, archiveUrl) => {
    const Charset = 'UTF-8';

    try {
        await new SES().sendEmail({
            Destination: {
                ToAddresses: [emailTo]
            },
            Message: {
                Body: {
                    Html: {
                        Charset,
                        Data: `<p>${emailFrom} send you some nice content.</p><p>You can download it here: ${archiveUrl}</p><p>${message}</p>`
                    }
                },
                Subject: {
                    Charset,
                    Data: "Your cat pics are here"
                },
            },
            Source: process.env.EMAIL_SOURCE
        }).promise();
    } catch (e) {
        console.log("Email could not be sent", e)
    }
}

router.post('/files', async (req, res) => {
    const {emailFrom, emailTo, files, message} = req.body

    if (!emailFrom || !emailTo || !files) {
        return res.status(400).json({message: "Sender, receiver and files have to be set"});
    }

    try {
        const archiveName = await archiveFiles(files)
        const url = `/files/${archiveName}`

        await sendEmail(emailFrom, emailTo, message, url)

        return res.status(201).json({
            url: url,
        })

    } catch (err) {
        return res.status(400).json({message: `Files not saved. Error msg: ${err}`});
    }

})

app.use('/', router)

module.exports = app

