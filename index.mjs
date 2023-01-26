import "regenerator-runtime/runtime.js"// for features built only for node js to work
import { BlobServiceClient, StorageSharedKeyCredential} from "@azure/storage-blob"
import express from 'express'
import cors from 'cors'
import multer from 'multer'
import dotenv from "dotenv"
dotenv.config();
const upload = multer({ dest: 'uploads/' });
const PORT = 3000  || process.env.PORT;
const accountName=process.env.ACCOUNT_NAME;
const accountKey=process.env.ACCOUNT_KEY;
if (!accountName) throw Error('Azure Storage accountName not found');
if (!accountKey) throw Error('Azure Storage accountKey not found')
const sharedKeyCredential = new StorageSharedKeyCredential(accountName, accountKey);



const blobServiceClient = new BlobServiceClient(
  `https://${accountName}.blob.core.windows.net`,
  sharedKeyCredential
);

let blobUrl;
let blockBlobClient;
 const  uploadBlob=  async (files)=>{
  try{
    const containerClient=  blobServiceClient.getContainerClient("cars")
        const promises = [];
        let urls=[]
        for (const file of files) {
          const blockBlobClient = containerClient.getBlockBlobClient(file.name);
              blobUrl= blockBlobClient.url;
          const stream = file.createReadStream();
          const uploadOptions = { bufferSize: 4 * 1024, maxBuffers: 5 };
          const fileSize = file.size
          promises.push(blockBlobClient.upload(stream, fileSize, uploadOptions));
          urls.push(blobUrl)
      }
        await Promise.all(promises);
       
        return urls;
        
  }
  catch(e){
console.log(e)
  }
    


}
const app=express()
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.post("/upload", upload.array("images"), async (req, res) => {
    const files = req.files;
  try{
  const urls = await uploadBlob(files);
  res.send(urls);
  }
  catch(e){
console.log(e.message)
res.send(e.message)
  }


});

app.listen(PORT,()=>{console.log("server listening")})
