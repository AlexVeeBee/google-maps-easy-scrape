const trustedDomains = [
    'https://www.google.com/maps/search',
    'https://www.google.com/maps/place',
    'https://www.google.com/maps/dir',
    'https://www.google.com/maps/@',
    'https://www.google.com/maps/embed',
    'https://www.google.com/maps/d/',
    'https://www.google.com/maps/timeline',
    'https://www.google.com/maps/reserve',
]

const getScrapingOptions = async () => {
    return new Promise((resolve, reject) => {
        chrome.storage.sync.get(['scrapingOptions'], (result) => {
            console.log('Scraping options', result.scrapingOptions);
            if (!result.scrapingOptions) {
                resolve({
                    ratings: true,
                    reviews: true,
                    phone: false,
                    address: false,
                    website: false
                });
                return;
            }
            resolve(result.scrapingOptions);
        });    
    });
}

// const placeholder_item = [{
//     scrapedate : "2021-01-01",
//     places : [
//         {
//             title : "Title",
//             rating : "Rating",
//             reviewCount : "ReviewCount",
//             phone : "Phone",
//             industry : "Industry",
//             address : "Address",
//             companyUrl : "CompanyUrl",
//             href : "Href"
//         },
//         {
//             title : "Title",
//             rating : "Rating",
//             reviewCount : "ReviewCount",
//             phone : "Phone",
//             industry : "Industry",
//             address : "Address",
//             companyUrl : "CompanyUrl",
//             href : "Href"
//         }
//     ],
// }, {
//     scrapedate : "2021-01-01",
//     places : [
//         {
//         }
//     ],
// }];


const saveScrapeData = async (data) => {
    console.log('data', data);
    let scrapingopts = {
        ratings: true,
        reviews: true,
        phone: false,
        address: false,
        website: false
    }
    try {
        scrapingopts = await getScrapingOptions();
    } catch (error) {
        log(`Error getting scraping options: ${error.message}`, "ERROR");
    }

    // filter data
    data = data.map((item) => {
        const newItem = {
            title: item.title,
            rating: item.rating,            // remove if the option from scrapingopts is false
            reviewCount: item.reviewCount,  // remove if the option from scrapingopts is false
            phone: item.phone,              // remove if the option from scrapingopts is false
            industry: item.industry,        // remove if the option from scrapingopts is false
            address: item.address,          // remove if the option from scrapingopts is false
            companyUrl: item.companyUrl,    // remove if the option from scrapingopts is false
            href: item.href
        }

        if (!scrapingopts.ratings) {
            delete newItem.rating;
        }
        if (!scrapingopts.reviews) {
            delete newItem.reviewCount;
        }
        if (!scrapingopts.phone) {
            delete newItem.phone;
        }
        if (!scrapingopts.address) {
            delete newItem.address;
        }
        if (!scrapingopts.industry) {
            delete newItem.industry;
        }
        if (!scrapingopts.website) {
            delete newItem.companyUrl;
        }
        console.log('newItem', newItem);
        return newItem;
    });

    console.log('scrapingopts', scrapingopts);
    console.log('final data', data);

    const m_body = `
    <p>This is the data that will be saved:</p>
    <table class="table table-striped">
        <thead>
            <tr>
                <th>Title</th>
                <th>Rating</th>
                <th>Reviews</th>
                <th>Phone</th>
                <th>Industry</th>
                <th>Address</th>
                <th>Website</th>
            </tr>
        </thead>
        <body>
            ${data.map((item) => {
                return `
                <tr>
                    <td>${item.title        || 'N/A'}</td>
                    <td>${item.rating       || 'N/A'}</td>
                    <td>${item.reviewCount  || 'N/A'}</td>
                    <td>${item.phone        || 'N/A'}</td>
                    <td>${item.industry     || 'N/A'}</td>
                    <td>${item.address      || 'N/A'}</td>
                    <td>${item.companyUrl   || 'N/A'}</td>
                </tr>
                `;
            }
            ).join('')}
        </body>
    </table>
    `;


    const m_footer = `
    <div style="display: flex; gap: 18px; margin: 0;" class="fullwidth">
        <button class="fullwidth btn btn-primary" id="confirm">Confirm</button>
        <button class="fullwidth btn btn-primary" id="close">Close</button>
    </div>`;

    // show notification
    const m = new modalCreator(
        "save-scrape-confirm",
        "Final confirmation",
        m_body,
        m_footer,
        {
        }
    )
    m.create();
    m.show();
    $(`#${m.id} #close`).click(() => {
        modalAPI.removeModal(m.id);
    });

    $(`#${m.id} #confirm`).click(() => {
    modalAPI.removeModal(m.id);

    // save to history
    chrome.storage.local.get(['history'], (result) => {
        try {
            var history = result.history || [];
            const randid = Math.random().toString(36).substring(7);
            history.push({
                // format date : "DD-MM-YYYY"
                id: randid,
                scrapedate: new Date().toLocaleDateString('en-GB'),
                places: data
            });
            chrome.storage.local.set({ history: history });
            const m_footer = `
            <div style="display: flex; gap: 18px; margin: 0;" class="fullwidth">
            <button class="fullwidth btn btn-primary" id="view">View history</button>
                <button class="fullwidth btn btn-primary" id="close">Close</button>
            </div>`;

            // show notification
            const m = new modalCreator(
                "save-scrape",
                "Scrape saved! 🎉",
                "The scrape has been saved to your history.",
                m_footer,
                {
                    class: "modal-md"
                }
            )
            m.create();
            m.show();
            $(`#${m.id} #view`).click(() => {
                modalAPI.removeModal(m.id);
                chrome.tabs.create({ url: '../pages/settings.html?page=history' });
            });
            $(`#${m.id} #close`).click(() => {
                modalAPI.removeModal(m.id);
            });
        } catch (error) {
            console.error(error);
            const m = new modalCreator(
                "error-scrape",
                "Error!",
                `An error occurred while saving the scrape: ${error.message}`,
                "",
                {}
            )
            m.create();
            m.show();
            setTimeout(() => {
                modalAPI.removeModal(m.id);
            }, 10000);
        }
    });
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // add dark theme attr to the body

    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var currentTab = tabs[0];
        const scrapeButton = document.getElementById('scrapeButton');
        const downloadCsvButton = document.getElementById('downloadCsvButton');
        const resultsTable = document.getElementById('resultsTable');
        const scrapeResults = document.getElementById('scrapeResults');
        const infobutton = document.getElementById('about-ext');
        const settingsButton = document.getElementById('ext-settings');
        const savescrape = document.getElementById('savescrape');

        if (currentTab && currentTab.url.includes("://www.google.com/maps/search")) {
            document.getElementById('message').textContent = "Click the shovel below to scrape the data from the current Google Maps search results.";
            scrapeButton.disabled = false;
            scrapeButton.classList.add('enabled');
        } else {
            const messageElement = $("#message");
            // set disabled to true
            scrapeButton.disabled = true;
            $("#table-actions, #scrapeResults").hide();

            // check if the current tab is a trusted domain
            var isTrustedDomain = false;
            for (var i = 0; i < trustedDomains.length; i++) {
                if (currentTab.url.includes(trustedDomains[i])) {
                    isTrustedDomain = true;
                    break;
                }
            }
            if (isTrustedDomain) {
                messageElement.text("Head over to the search bar to start scraping data from Google Maps.");
            }
            if (!isTrustedDomain) {
                messageElement.text("This extension only works on Google Maps search results pages.");
                messageElement.css("color", "red");
                const button = $("<button>").text("Open Google Maps").addClass("btn btn-primary").click(function() {
                    chrome.tabs.create({ url: 'https://www.google.com/maps/search/' });
                });
                messageElement.append(button);
            }
        }
        let global_results = [];

        scrapeButton.addEventListener('click', function() {
            var messageElement = $("#message");
            messageElement.text("Scraping data from the current Google Maps search results...");
            chrome.scripting.executeScript({
                target: {tabId: currentTab.id},
                function: scrapeData
            }, function(results) {
                messageElement.text("Scraping complete!");
                scrapeResults.classList.add('visible');
                while (resultsTable.firstChild) {
                    resultsTable.removeChild(resultsTable.firstChild);
                }

                // Define and add headers to the table
                const headers = ['Title', 'Rating', 'Reviews', 'Phone', 'Industry', 'Address', 'Website', 'Google Maps Link'];
                const headerRow = document.createElement('tr');
                headers.forEach(headerText => {
                    const header = document.createElement('th');
                    header.textContent = headerText;
                    headerRow.appendChild(header);
                });
                resultsTable.appendChild(headerRow);

                // Add new results to the table
                if (!results || !results[0] || !results[0].result) return;
                global_results = results[0].result;
                results[0].result.forEach(function(item) {
                    var row = document.createElement('tr');
                    ['title', 'rating', 'reviewCount', 'phone', 'industry', 'address', 'companyUrl', 'href'].forEach(function(key) {
                        var cell = document.createElement('td');
                        
                        if (key === 'reviewCount' && item[key]) {
                            item[key] = item[key].replace(/\(|\)/g, ''); 
                        }
                        
                        cell.textContent = item[key] || ''; 
                        row.appendChild(cell);
                    });
                    resultsTable.appendChild(row);
                });

                if (results && results[0] && results[0].result && results[0].result.length > 0) {
                    downloadCsvButton.disabled = false;
                    savescrape.disabled = false;
                }
            });
        });

        downloadCsvButton.addEventListener('click', function() {
            var csv = tableToCsv(resultsTable); 
            var filename = filenameInput.value.trim();
            if (!filename) {
                filename = 'google-maps-data.csv'; 
            } else {
                filename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase() + '.csv';
            }
            downloadCsv(csv, filename); 
        });

        infobutton.addEventListener('click', function() {
            chrome.tabs.create({ url: '../pages/settings.html?page=about' }); 
        });

        settingsButton.addEventListener('click', function() {
            chrome.tabs.create({ url: '../pages/settings.html?page=general' }); 
        });

        savescrape.addEventListener('click', function() {
            saveScrapeData(global_results);
        });
    });
});

function scrapeData() {
    var links = Array.from(document.querySelectorAll('a[href^="https://www.google.com/maps/place"]'));
    return links.map( link => {
        var container = link.closest('[jsaction*="mouseover:pane"]');
        var titleText = container ? container.querySelector('.fontHeadlineSmall').textContent : '';
        var rating = '';
        var reviewCount = '';
        var phone = '';
        var industry = '';
        var address = '';
        var companyUrl = '';


        // Rating and Reviews
        if (container  ) {
            var roleImgContainer = container.querySelector('[role="img"]');
            
            if (roleImgContainer) {
                var ariaLabel = roleImgContainer.getAttribute('aria-label');
            
                if (ariaLabel && ariaLabel.includes("stars")) {
                    var parts = ariaLabel.split(' ');
                    var rating = parts[0];
                    var reviewCount = '(' + parts[2] + ')'; 
                } else {
                    rating = '0';
                    reviewCount = '0';
                }
            }
        }

        // Address and Industry
        if (container) {
            var containerText = container.textContent || '';
            var addressRegex = /\d+ [\w\s]+(?:#\s*\d+|Suite\s*\d+|Apt\s*\d+)?/;
            var addressMatch = containerText.match(addressRegex);

            if (addressMatch) {
                address = addressMatch[0];

                // Extract industry text based on the position before the address
                var textBeforeAddress = containerText.substring(0, containerText.indexOf(address)).trim();
                var ratingIndex = textBeforeAddress.lastIndexOf(rating + reviewCount);
                if (ratingIndex !== -1) {
                    // Assuming industry is the first significant text after rating and review count
                    var rawIndustryText = textBeforeAddress.substring(ratingIndex + (rating + reviewCount).length).trim().split(/[\r\n]+/)[0];
                    industry = rawIndustryText.replace(/[·.,#!?]/g, '').trim();
                }
                var filterRegex = /\b(Closed|Open 24 hours|24 hours)|Open\b/g;
                address = address.replace(filterRegex, '').trim();
                address = address.replace(/(\d+)(Open)/g, '$1').trim();
                address = address.replace(/(\w)(Open)/g, '$1').trim();
                address = address.replace(/(\w)(Closed)/g, '$1').trim();
            } else {
                address = '';
            }
        }

        // Company URL
        if (container) {
            var allLinks = Array.from(container.querySelectorAll('a[href]'));
            var filteredLinks = allLinks.filter(a => !a.href.startsWith("https://www.google.com/maps/place/"));
            if (filteredLinks.length > 0) {
                companyUrl = filteredLinks[0].href;
            }
        }

        // Phone Numbers
        if (container) {
            // find the class "UsdlK" and get the phone number
            var phoneContainer = container.querySelector('.UsdlK');
            if (phoneContainer) {
                phone = phoneContainer.textContent;
            }
            
        }

        // Return the data as an object
        return {
            title: titleText,
            rating: rating,
            reviewCount: reviewCount,
            phone: phone,
            industry: industry,
            address: address,
            companyUrl: companyUrl,
            href: link.href,
        };
    });
}

// Convert the table to a CSV string
function tableToCsv(table) {
    var csv = [];
    var rows = table.querySelectorAll('tr');
    
    for (var i = 0; i < rows.length; i++) {
        var row = [], cols = rows[i].querySelectorAll('td, th');
        
        for (var j = 0; j < cols.length; j++) {
            row.push('"' + cols[j].innerText + '"');
        }
        csv.push(row.join(','));
    }
    return csv.join('\n');
}

// Download the CSV file
function downloadCsv(csv, filename) {
    var csvFile;
    var downloadLink;

    csvFile = new Blob([csv], {type: 'text/csv'});
    downloadLink = document.createElement('a');
    downloadLink.download = filename;
    downloadLink.href = window.URL.createObjectURL(csvFile);
    downloadLink.style.display = 'none';
    document.body.appendChild(downloadLink);
    downloadLink.click();
}