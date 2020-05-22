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
        var revisionObjects = [];
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
                    revisionObjects.push(array[i]);
                    revisionItems = revisionItems.concat(arrayOfNameAndLink);
                }
            }
        }
        chrome.storage.sync.set({'revisionObjects': revisionObjects},function(){});
        // Retrieve today's list which is to be revised.
        var list = "";
        for(element of revisionItems){
            list += '<li><a href =' + element[1] + ' target="_blank">' + element[0] + '</a></li>';
        }
        if(list.length > 0)
            $('#revisionList').append(list);
        else
            $('#revisionList').append('<li>No Revision Today Yay Create your today\'s list</li>');
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
                var remove = '&nbsp;<input type="submit" ' + ' class = "remove-me" value="Remove">'
                var edit = '&nbsp;<input type="submit" ' + ' class = "edit-me" value="Edit">'
                for (element of arrayOfNameAndLink) {
                    list2 += '<li><a href =' + element[1] + ' target="_blank">' + element[0] + '</a>' + remove + edit +'</li>';
                }
                if (list2.length > 0)
                    $('#newList').append(list2);
            }
        }
    });

    $('#listInsert').click(function(){
        $('.center').hide();
        $('#show').show();
        chrome.storage.sync.get(['array', 'listObject'], function(storage) {
            var listObject = storage.listObject[0];
            var name = $('#name').val().toString(); // change if this doesnt works
            name = name.trim();
            var link = $('#link').val().toString();
            if(!(jQuery.isEmptyObject(name) || jQuery.isEmptyObject(link))) {
                listObject.arrayOfNameAndLink.push([name, link]);
                chrome.storage.sync.set({'listObject': [listObject]}, function () {
                });
                var edit = '&nbsp;<input type="submit" ' + ' class = "edit-me" value="Edit">'
                var remove = '&nbsp;<input type="submit" ' + ' class = "remove-me" value="Remove">'
                $('#newList').append('<li><a href=' + link + ' target="_blank">' + name + '</a>' + remove + edit +'</li>');
                $('#name').val('');
                $('#link').val('');
            }
        });
    })
    var entry, prevName, prevLink;
    // ??
    $('#editListInsert').click(function(){
        $('.edit').hide();
        $('#show').show();
        var currentName = $('#editName').val().toString();
        var currentLink = $('#editLink').val().toString();
        currentName = currentName.trim();
        chrome.storage.sync.get(['listObject'], function(storage){
            var listObject = storage.listObject || [];
            listObject = listObject[0];
            var array = listObject.arrayOfNameAndLink || []
            for(var i = 0; i < array.length; i++){
                var arrayName = array[i][0];
                if(arrayName == prevName || arrayName == undefined){
                    array[i][0] = currentName;
                    array[i][1] = currentLink;
                    break;
                }
            }
            var edit = '&nbsp;<input type="submit" ' + ' class = "edit-me" value="Edit">'
            var remove = '&nbsp;<input type="submit" ' + ' class = "remove-me" value="Remove">'
            entry.html('<li><a href=' + currentLink + ' target="_blank">' + currentName + '</a>' + remove + edit +'</li>')
            listObject.arrayOfNameAndLink = array;
            chrome.storage.sync.set({'listObject': [listObject]}, function(){})
        })
    })

    $(document).ready(function () {
        $(document).on('mouseenter', '#newList', function () {
            $(this).find(".remove-me").show();
            $(this).find(".edit-me").show();
        }).on('mouseleave', '#newList', function () {
            $(this).find(".remove-me").hide();
            $(this).find(".edit-me").hide();
        });
    });
    $('#show').on('click', function () {
        $('.center').show();
        $(this).hide();
    })

    $('#close').on('click', function () {
        $('.center').hide();
        $('#show').show();

    })

    $('#editClose').on('click', function (){
        $('.edit').hide();
        $('#show').show();
    })



    $(document).on('click', ".edit-me", function(e){
        entry = $(this).parent();
        var name = entry.text();
        // removes the trailing and pre spaces
        name = name.trim();
        $('.edit').show();
        $('#show').hide();
        chrome.storage.sync.get(['listObject'], function(storage){
            var listObject = storage.listObject || [];
            listObject = listObject[0];
            var array = listObject.arrayOfNameAndLink || []
            for(var i = 0; i < array.length; i++){
                var arrayName = array[i][0];
                if(arrayName == name || arrayName == undefined){
                    prevName = array[i][0];
                    prevLink = array[i][1];
                    $('#editName').val(array[i][0]);
                    $('#editLink').val(array[i][1]);
                }
            }
        });
    });
    $(document).on('click', ".remove-me", function(e){
        var entry = $(this).parent();
        var name = entry.text();
        // removes the trailing and pre spaces
        name = name.trim();
        chrome.storage.sync.get(['listObject'], function(storage){
            var listObject = storage.listObject || [];
            listObject = listObject[0];
            var array = listObject.arrayOfNameAndLink || []
            for(var i = 0; i < array.length; i++){
                var arrayName = array[i][0];
                if(arrayName == name || arrayName == undefined){
                    // removes the element then break.
                    array.splice(i, 1);
                    break;
                }
            }
            listObject.arrayOfNameAndLink = array;
            chrome.storage.sync.set({'listObject': [listObject]}, function(){})
        });
        entry.remove();
    });
});