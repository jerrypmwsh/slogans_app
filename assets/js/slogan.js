var base_url = "http://localhost:8080";
var categories = new Map();
var sources = new Map();
var count = 0;

function getCategories() {
    return fetch(base_url + "/categories",
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => response.json())
        .then(json => {
            json.forEach(category => categories.set(category.category, category.c_id));
        });
}

function getSources() {
    return fetch(base_url + "/sources",
        {
            method: 'GET',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(response => response.json())
        .then(json => {
            json.forEach(source => sources.set(source.source, source.src_id));
        });
}

function addSlogan() {
    var form = $("#id_add")
    var slogan = {};
    form.serializeArray().forEach(entry => slogan[entry.name] = entry.value);
    slogan.categoryId = categories.get(slogan.category);
    slogan.sourceId = sources.get(slogan.source);

    fetch(base_url + '/slogans',
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'Authorization': 'Bearer ' + localStorage.getItem('access_token') //TODO: Move to common method
            },
            body: JSON.stringify(JSON.stringify(slogan))
        })
        .then(response => response.text())
        .then(text => {
            slogan.id = text
            addRow(slogan)
        });
    
    form[0].reset();
    return false;
}

function renderOptions() {
    var category_select = $("#id_category_select");
    Array.from(categories.keys())
        .forEach(category => addOption(category_select, category));

    var source_select = $("#id_source_select");
    Array.from(sources.keys())
        .forEach(source => addOption(source_select, source));
}

function addOption(select, text) {
    var option = document.createElement("option");
    option.text = text;
    select.append(option);
}

function addRow(slogan) {
    $("#id_slogans").tabulator("addRow", slogan)
}

function deleteRows() {
    if (!confirm("Delete the selected rows?")) {
        return
    }
    rows = $("#id_slogans").tabulator("getSelectedRows")
    rows.forEach(row => {
        fetch(base_url + `/slogans/${row.getData().s_id}`,
        {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                'Authorization': 'Bearer ' + localStorage.getItem('access_token')
            }
        })
        .then(handleResponse)
        .then(response => response.json())
        .then(response => row.delete()) //TODO: Sometimes selected rows don't disappear from the table after deletion, but are deleted from DB.
        .catch(error => console.log(`Unable to delete slogan: ${error}`))
    })
}


function displayProfile() {
  // display the profile
  var buttons = document.getElementById("id_logout");
  var pic = localStorage.getItem('picture');
  buttons.innerHTML = `<img src="${pic}" />`;
}

function handleResponse(response) {
    if (!response.ok) {
        throw Error(response.statusText)
    }
    return response
}

$(function () {
    //create Tabulator on DOM element with id "example-table"
    $("#id_slogans").tabulator({
        height: "800px",
        layout:"fitDataFill",
        addRowPos:"top",
        pagination:"local",
        selectable: true,
        columns:[
            {title:"ID", field:"s_id", editor:false, visible:false, sorter:"number"},
            {title:"SLOGAN", field:"slogan", align:"left", headerFilter:"input", editor:true},
            {title:"COMPANY", field:"company", align:"center", headerFilter:"input", editor:true},
            {title:"CATEGORY", field:"category", align:"center", headerFilter:"input", editor:true},
            {title:"SOURCE", field:"source", align:"center", headerFilter:"input", editor:true},
            {title:"SOURCE_INFO", field:"source_info", align:"center", headerFilter:"input", editor:true},
        ],
        cellEdited:function(cell) {
            if(cell.getField() === 's_id') {
                return;
            }
            row = cell.getRow()
            rowData = row.getData()
            rowData.source_id = sources.get(rowData.source)
            rowData.category_id = categories.get(rowData.category)
            requestData = JSON.stringify(rowData)
            fetch(base_url + '/slogans',
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                    'Authorization': 'Bearer ' + localStorage.getItem('access_token')
                },
                body: JSON.stringify(requestData) //TODO: Why does stringifying twice work?
            })
            .then(handleResponse)
            .then(response => response.json())
            .then(s_id => {
                idCell = row.getCell('s_id')
                idCell.setValue(s_id, false)
            })
            .catch(error => console.log(`Unable to update slogan. Error: ${error}`))

        },
        cellEditing:function(cell) {
            cell.getRow().toggleSelect();
        }
    });

    getCategories()
        .then(getSources)
        .then(renderOptions);
});


$.ajax({
    url: base_url + "/slogans",
    type: "get",
    async: true,
    dataType:'json',
    headers:{
        'Authorization': 'Bearer ' + localStorage.getItem('access_token')
    },
    success: function (data) {
        $("#id_slogans").tabulator("setData", data);
    },
});
