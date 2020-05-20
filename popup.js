/*
To Do:
1. Both input field should not get cleared if i change my tab store the values of in database.
2. Provide a feature to delete the item in the current list and revision list.
3. Add css.
5. Provide the Edit option also in the list
6. Improve the UI (take inspiration from Todoist application. :P)
7. Check if the names in the list can go sideways!.
8. Make an options page where user can see all its data and all its information in a table
9. Provide user the capability to export the data from options page into a csv.
10. Implement Context menu functionality if i select an item and right click and click on the extension it should directly add.
11. Name and link should not be empty implement input validation.
optional
8. Integrate Google calender api for the revision time.
 */

$(function(){
    var array = [];
    // Retrieve the array where all elements are stored and retrieve the listObject if created..
    chrome.storage.sync.get(['array', 'listObject'], function(storage){
        var revisionItems = [];
        var listObject = storage.listObject || [];
        listObject = listObject[0];
        var currentDate = new Date();
        //We are only comparing dates only without time.
        currentDate.setHours(0,0,0,0);
        //for testing purpose only remove this
        //currentDate.setDate((currentDate.getDate() +1));
        // check if the size of the array in the storage is greater than zero
        if(storage.array && storage.array.length > 0){
            array = storage.array || [];
            for(var i = 0; i < array.length; i++){
                var revisionDate = new Date(array[i].revisionDate);
                var originalDate = new Date(array[i].originaldate);
                if(revisionDate.valueOf() == currentDate.valueOf()){
                    var arrayOfNameAndLink = array[i].arrayOfNameAndLink;
                    arrayOfNameAndLink = (arrayOfNameAndLink) ? arrayOfNameAndLink : []; // null check
                    array[i].revisionDate = revisionDate.toJSON();
                    revisionItems = revisionItems.concat(arrayOfNameAndLink);
                }
            }
        }
        // Retrieve today's list which is to be revised.
        var list = "";
        for(element of revisionItems){
            list += '<li><a href =' + element[1] + ' target="_blank">' + element[0] + '</a></li>';
        }
        if(list.length > 0)
            $('#revisionList').append(list);
        // Initialize the list object if it is empty.
        if(jQuery.isEmptyObject(listObject)){
            //Add links and names to the today's list
            listObject = {}
            listObject.originaldate = new Date();
            listObject.originaldate.setHours(0,0,0,0);
            listObject.originaldate = (listObject.originaldate).toJSON();
            listObject.revisionDate = new Date();
            listObject.revisionDate.setHours(0,0,0,0);
            // set the revision date to +1 then Date it was created.
            listObject.revisionDate.setDate(listObject.revisionDate.getDate() + 1);
            listObject.revisionDate = (listObject.revisionDate).toJSON();
            listObject.fibIndex = -1;
            listObject.arrayOfNameAndLink = [];
            chrome.storage.sync.set({'listObject' : [listObject]}, function(){
            })
        }else{
            var arrayOfNameAndLink = listObject.arrayOfNameAndLink;
            if(!jQuery.isEmptyObject(arrayOfNameAndLink)) {
                var list2 = "";
                for (element of arrayOfNameAndLink) {
                    list2 += '<li><a href =' + element[1] + ' target="_blank">' + element[0] + '</a></li>';
                }
                if (list2.length > 0)
                    $('#newList').append(list2);
            }
        }
    });
    var arrayOfNameAndLink = [];
    $('#listInsert').click(function(){
        chrome.storage.sync.get(['array', 'listObject'], function(storage) {
            var listObject = storage.listObject[0];
            var name = $('#name').val().toString(); // change if this doesnt works
            var link = $('#link').val().toString();
            if(!(jQuery.isEmptyObject(name) || jQuery.isEmptyObject(link))) {
                listObject.arrayOfNameAndLink.push([name, link]);
                chrome.storage.sync.set({'listObject': [listObject]}, function () {
                });
                $('#newList').append('<li><a href=' + link + '>' + name + '</a></li>');
            }
        });
    })
});