const categories = ['Motivation', 'Stressreduktion', 'Bewegung'];
let current_category_index = Math.floor(Math.random() * 3);

async function fetchGoogleSheetData() {
    const url = 'https://docs.google.com/spreadsheets/d/1_HKt_DSxewR-XaneTc88o6v3yyGV23sqKOFXHDCGz6Q/gviz/tq?tqx=out:json';

    try {
        const response = await fetch(url);
        const text = await response.text();
        // get json from textresponse (Google Speadsheet API requires API-key, even for reading access)
        const json = JSON.parse(text.substring(47, text.length - 2));

        // if a row was selected we increase the weight, to ensure that the same row gets not selected multiples time right after each other
        rows = (json.table.rows.map(row => row.c.map(cell => cell?.v || ''))).map(row => row = { 'content': row, 'weight': 0 });

        // set an inital Category at random
        selectRandomRow();
        document.getElementById('next-tip-button').style.display = "block"

    } catch (error) {
        document.getElementById('tip-title').textContent = 'Error loading data';
        console.error('Error fetching or parsing Google Sheet data:', error);
    }
}

function readDataFromFile() { };

function selectRandomRow() {
    if (rows.length === 0) {
        document.getElementById('tip-title').textContent = 'No data available';
        document.getElementById('tip-description').textContent = '';
        document.getElementById('tip-category').textContent = '';
        return;
    }

    // get rows where categroy = current category
    let rows_subset = rows.filter((row) => row.content[2] == categories[current_category_index]);

    // now only select rows with lowest weight (i.e. 0)
    let min_weight = Math.min(...rows_subset.map(row => row.weight));
    rows_subset = rows_subset.filter((row) => row.weight == min_weight);

    // select row from rows with lowest weight in this category at random
    selected_row = rows_subset[Math.floor(Math.random() * rows_subset.length)];

    // if (categories[current_category_index] == 'Bewegung') { console.log(rows_subset.map(rows => rows.content[0])) };

    writeContent(selected_row);

    // give weight to selected row (so that it can only be selected after five iterations in this category [if category has >5 entries])
    rows[rows.indexOf(selected_row)].weight = 5 * categories.length + 1;

    // decrement all row weight that are > 0
    for (let row_index in rows) {
        if (rows[row_index].weight != 0) {
            rows[row_index].weight--;
        }
    }

    // update category index
    current_category_index = (current_category_index + 1) % 3;
    setTimeout(() => {
        document.getElementById('next-tip-button').blur()
    }, 100);

}

function writeContent(row) {
    if (document.getElementById('lang-switch-button').textContent == 'de') {
        document.getElementById('tip-title').textContent = row.content[0 + 3];
        document.getElementById('tip-description').innerHTML = row.content[1 + 3];
        document.getElementById('tip-category').textContent = row.content[2 + 3];
    } else {
        document.getElementById('tip-title').textContent = row.content[0];
        document.getElementById('tip-description').innerHTML = row.content[1];
        document.getElementById('tip-category').textContent = row.content[2];
    }
}

document.getElementById('next-tip-button').addEventListener('click', selectRandomRow);


fetchGoogleSheetData();

document.addEventListener("DOMContentLoaded", () => {
    const langSwitcher = document.getElementById("lang-switch-button");

    function loadLanguage() {
        fetch(`lang/lang.json`)
            .then(response => response.json())
            .then(lang_data => {
                lang = document.getElementById('lang-switch-button').textContent
                document.getElementById("page-title").textContent = lang_data.page_title[lang]
                document.getElementById("next-tip-button").textContent = lang_data.next_tip_button[lang]
                document.getElementById("feedback-link").textContent = lang_data.feedback_link[lang]
                document.getElementById("lang-switch-button").textContent = lang_data.lang_switch[lang]
                writeContent(selected_row)
            })
            .catch(error => console.error("Error loading language file:", error));
        setTimeout(() => {
            document.getElementById('lang-switch-button').blur()
        }, 100);
    }



    // Event listeners for switching language
    langSwitcher.addEventListener("click", loadLanguage)
});