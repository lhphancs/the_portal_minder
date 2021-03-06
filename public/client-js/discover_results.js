var load_all_users = function(mode){
    var ending_path;
    switch(mode){
        case "all": ending_path = "get-all-users"; break;
        case "local": ending_path = "get-all-local-users"; break;
        case "tags": ending_path = "get-all-tags-users"; break;
        default: alert("load_all_users() did not detect any modes!");
    }
    $.ajax({
        url:"/discover/" + ending_path,
        data:{},
        dataType:"json",
        type:"GET",
    }).done(function(json){
        var matched_users_container = $("#matched_users_container");
        if(json.length ===0){
            matched_users_container.append(
                `<h1>No match found</h1>`
            );
        }
        else{
            //Show each user
            for(var i=0; i<json.length; ++i){
                var user_first_name = json[i].firstName;
                var user_last_name = json[i].lastName;
                var user_id = json[i]._id;
                var photo_url = json[i].photoURL?json[i].photoURL:"/images/logo.jpg";

                var display_name = user_first_name + " " + user_last_name;
                var user_profile_href = "/discover/profile/" + user_id;

                //Create elements to add to container
                var other_user_container = `<div class="other_user_container">
                    <a class="other_user_name" href="${user_profile_href}">${display_name}</a>
                    <a href="${user_profile_href}"><img class="other_user_img" src="${photo_url}"></a>
                    <button class="btn btn-secondary btn-block btn_add_friend add-pending-mode" data-other-id="${user_id}">Add</button>
                </div>`;

                matched_users_container.append(other_user_container);
            }
        }
    }).fail(function(){
        alert("Failed to grab data from database");
        return false;
    });
}

var set_btn_response_toggle_add_friend = function(){
    $("#matched_users_container").on("click", ".btn_add_friend", function(){
        var select_user_id = $(this).attr("data-other-id");
        if( $(this).hasClass("add-pending-mode") ){
            $(this).text("Remove");
            $.ajax({
                url: "/friends/add-pending-friend",
                data: {select_user_id: select_user_id},
                type: "PATCH",
                dataType: "json"
            }).done(function(json){
                if(json.notify_is_on){
                    socket.emit('notify', {
                        self_id: self_id,
                        select_user_id: select_user_id,
                        type: NOTIFY_TYPE.add_pending,
                        msg: "Friend request: " + self_name
                    });
                }
            }).fail(function(){
                alert("FAILED ADD");
            });
        }
        else{
            $(this).text("Add");
            $.ajax({
                url: "/friends/remove-pending-friend",
                data: {select_user_id: select_user_id},
                type: "PATCH",
                dataType: "json"
            }).done(function(json){
                if(json.notify_is_on){
                    //Now notify other user
                    socket.emit('notify', {
                    self_id: self_id,
                    select_user_id: select_user_id,
                    type: NOTIFY_TYPE.remove_pending,
                    msg: "Friend request cancelled: " + self_name
                });
                }
            }).fail(function(){
                alert("FAILED REMOVE");
            });
        }
        $(this).toggleClass("add-pending-mode");
    });
};

var main = function(){
    load_all_users(mode); // mode variable is loaded in discover_results.html is there way to extract w/ javascript?
    set_btn_response_toggle_add_friend();
};

$(document).ready(function(){
    main();
});