var fib = [1, 1, 2, 3, 4, 5, 7, 10, 14, 19, 25, 34, 46, 62, 83, 112, 150, 202, 271, 365]; // 1 year
function updateArray(){
    chrome.storage.sync.get(['array', 'listObject'], function (storage) {
        // Notify that the current list is going to get stored in the main array.
        var notifOptions = {
            type: 'basic',
            iconUrl: 'icon48.png',
            title: 'Today\'s List Submitted!',
            message: 'Your Today\'s list has been submitted!'
        }
        chrome.notifications.create('limitNotif', notifOptions);
        var currentDate = new Date();
        var listObject = storage.listObject[0];
        var listObjectOriginalDate = new Date(listObject.originaldate);
        var array = storage.array || [];
        currentDate.setHours(0,0,0,0);
        // remove this after testing.
        //currentDate.setDate((currentDate.getDate() +1));
        // Check if the listObject we created on a day passes its current date.
        if (listObjectOriginalDate.valueOf() < currentDate.valueOf()) {
            array.push(listObject);
            // store it back into the array.
            chrome.storage.sync.set({'listObject': {}}, function () {
            });
            chrome.storage.sync.set({'array': array}, function () {
            });
        }
        //We are only comparing dates only without time.
        currentDate.setHours(0, 0, 0, 0);
        // check if the size of the array in the storage is greater than zero
        if (array && array.length > 0) {
            for (var i = 0; i < array.length; i++) {
                var revisionDate = new Date(array[i].revisionDate);
                if (revisionDate.valueOf() < currentDate.valueOf()) {
                    var fibIndex = parseInt(array[i].fibIndex);
                    var arrayOfNameAndLink = array[i].arrayOfNameAndLink;
                    arrayOfNameAndLink = (arrayOfNameAndLink) ? arrayOfNameAndLink : []; // null check
                    fibIndex++;
                    revisionDate.setDate(revisionDate.getDate() + fib[fibIndex]);
                    array[i].revisionDate = revisionDate.toJSON();
                }
            }
            chrome.storage.sync.set({'array': array}, function () {
            });
        }
    });
}


// This function checks if the date has been changed or not.
setInterval(function timeChecker() {
    chrome.storage.sync.get(['listObject'], function(storage){
        var listObject = storage.listObject || [];
        listObject = listObject[0];
        var originaldate = new Date(listObject.originaldate);
        var currentDate = new Date();
        // Testing purpose
        //currentDate.setDate(currentDate.getDate() + 1);
        currentDate.setHours(0,0,0,0);
        if(currentDate.valueOf() > originaldate.valueOf()){
            updateArray();
        }
    });
}, 1000 * 60) // Runs every minute.

var contextMenuItem = {
    "id" : "storeCurrentLink",
    "title": "Add current website in today's list",
    "contexts": ["selection"] // Go though chrome developer web page for more options.
};

chrome.contextMenus.create(contextMenuItem);
chrome.contextMenus.onClicked.addListener(function(clickData){
    if(clickData.menuItemId == "storeCurrentLink" && clickData.selectionText){
        var name = clickData.selectionText;
        var link = clickData.pageUrl;
        chrome.storage.sync.get(['listObject'], function(storage){
           var listObject = storage.listObject[0];
           listObject.arrayOfNameAndLink.push([name, link]);
           chrome.storage.sync.set({'listObject': [listObject]}, function(){});
        });
    }
})