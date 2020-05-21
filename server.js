const MongoClient = require('mongodb').MongoClient;
const Confirm = require('prompt-confirm');
const prompt = new Confirm('Do you want to continue?');

const url = 'mongodb://localhost:27017/DBClientsPPK';

(() => {
    MongoClient.connect(url, async (err, db) => {
        if(err){
            console.log('No connection to Database! Please start MongoDB service on default port 27017!\n');                         
            console.log(err);
            await sleep(10000);
        } else {
            console.log('Connected to database successfully!\n');            

            countAllOnlinePpk(db, async (ppkArray) => {
                //console.log("ppkArray", ppkArray);

                if(ppkArray.length > 0){
                    ppkArray.sort((a, b) => a.ppk_num - b.ppk_num);

                    console.log(`Enabling command will be sent to each device online with timeout of 60 seconds!`);
                    console.log(`Total time for program execution: ${convertMinutes(ppkArray.length)} \n`)

                    prompt.ask((answer) => {                       
                        if(answer){
                            let counter = 0;
                            ppkArray.forEach((ppk, index) => {
                                setTimeout(async () => {
                                    await sendPollingToPpk(db, ppk.ppk_num, () => {
                                        console.log(`Enabling sent to ppk number ${ppk.ppk_num}`);                               
                                    });   
                                    
                                    counter++;
                                    if(counter === ppkArray.length){
                                        setTimeout(async () => {
                                            console.log('All ppks received command! \nApplication will be closed automatically in 30 seconds!');
                                            db.close();
                                            await sleep(30000);
                                        }, 30000);                                
                                    };
                                }, index * 60000);
                            });
                        } else {
                            db.close();
                            return null;
                        }               
                    });                  
                } else {
                    console.log('No ppks online and disabled... \nApplication will be closed automatically in 10 seconds!')
                    db.close();
                    await sleep(10000);
                }
                await sleep(10000);
            });
            
        }
    });

    
})();

const sleep = (timeout) => {
    return new Promise((resolve) => {
        setTimeout(resolve, timeout);        
    });
};

// Collection 'ppkState'
const countAllOnlinePpk = (db, callback) => {
    setTimeout(() => {
        db.collection('ppkState', async (err, collection) => {
            if(err) {
                console.log(err);
                db.close();
                await sleep(10000);
            };
      
            // Get all ppk online and disabled at the moment from collection ppkState
            const onlinePpk = await collection.find({ lastActivity: {$gt: (Date.now() - 4 * 60 * 1000) }, enabled: false}).count();           
            console.log(`Total online and disabled ppks at the moment: ${onlinePpk}`); 
         
            await collection.find({ lastActivity: {$gt: (Date.now() - 4 * 60 * 1000) }, enabled: false}).toArray((err, ppkArray) => {
                
                callback(ppkArray);

            });                    
        });        
    }, 1000);    
};


// Insert query 'enable' in Collection 'ppkCommandQueue'
const sendPollingToPpk = (db, ppk_num, callback) => {
    db.collection('ppkCommandQueue', async (err, collection) => {
        if(err) {
            console.log(err);
            db.close();
            await sleep(10000);
        };
        
        await collection.insertOne({ 
            ppkNum : ppk_num,
            message: "ENABLE",
            time: Date.now() 
        }, async (err, result) => {
            if(err){
                console.log(err);
                db.close();
                await sleep(10000);
            };         
            console.log(`${result}\n`);
        });
        callback();
    });
};

// Convert minutes to hours and minutes
const convertMinutes = (min) => {
    const hours = (min / 60);
    const rhours = Math.floor(hours);
    const minutes = (hours - rhours) * 60;
    const rminutes = Math.round(minutes);
    return `${rhours} hour(s) ${rminutes} minute(s)`;
};