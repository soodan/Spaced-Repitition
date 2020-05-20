$(function(){
    $('#dateSubmitted').click(function(){
        $('#requestedList').empty();
        var date = new Date($('#date').val());
        date.setHours(0,0,0,0);
        chrome.storage.sync.get(['array', 'listObject'], function(storage) {
            var array = storage.array || [];
            var listObject = storage.listObject || [];
            listObject = listObject[0]
            var currentDate = new Date();
            currentDate.setHours(0,0,0,0);
            var items = [];
            if(date.valueOf() == currentDate.valueOf()){
                if(listObject.arrayOfNameAndLink.length > 0)
                    items = items.concat(listObject.arrayOfNameAndLink);
            }
            for(var i = 0; i < array.length; i++) {
                var revisionDate = new Date(array[i].revisionDate);
                if (revisionDate.valueOf() == date.valueOf()) {
                    var arrayOfNameAndLink = array[i].arrayOfNameAndLink;
                    arrayOfNameAndLink = (arrayOfNameAndLink) ? arrayOfNameAndLink : []; // null check
                    array[i].revisionDate = revisionDate.toJSON();
                    items = items.concat(arrayOfNameAndLink);
                }
            }
            var list = "";
            for(element of items){
                list += '<li><a href =' + element[1] + ' target="_blank">' + element[0] + '</a></li>';
            }
            if(list.length > 0)
                $('#requestedList').append(list);
            else
                $('#requestedList').append("<h2>No list scheduled on asked date, choose some other date !!</h2>")
        });
    });
})