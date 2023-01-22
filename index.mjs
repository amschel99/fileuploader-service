import "regenerator-runtime/runtime"// for features built only for node js to work
import { BlobServiceClient, StorageSharedKeyCredential} from "@azure/storage-blob"
import express from 'express'
import cors from 'cors'
import multer from 'multer'

const upload = multer({ dest: 'uploads/' });
const PORT = 3000  || process.env.PORT;
const accountName="motaautombiles"
const accountKey='9mvfsI+x7fmnEEv9LDjwPxZkd4erWnTKwWvKkoPjtemXSXCCINSLn6Eb1PYowFyErSCukhDqkbC/+AStwkwQsw=='
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
                blobUrl= blockBlobClient.url;// 
            promises.push(blockBlobClient.uploadBrowserData(file));
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
  const urls = await uploadBlob(files);
  res.send(urls);
});

app.listen(PORT,()=>{console.log("server listening")})
