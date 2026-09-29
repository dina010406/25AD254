const API = "";

let zones = [];
let ambulances = [];
let calls = [];
let distances = [];

const $ = id => document.getElementById(id);


/* =====================================================
   LOAD BACKEND DATA
   ===================================================== */

async function loadData(silent = false) {

    try {

        const [z, a, c, d] = await Promise.all([

            fetch(API + "/zones").then(r => r.json()),

            fetch(API + "/ambulances").then(r => r.json()),

            fetch(API + "/calls").then(r => r.json()),

            fetch(API + "/zones/distance").then(r => r.json())

        ]);

        zones = z;
        ambulances = a;
        calls = c;
        distances = d;

        renderAll();

        if (!silent) {
            showToast("Dashboard refreshed");
        }

    } catch (error) {

        console.error(error);

        showToast(
            "Unable to connect to backend"
        );
    }
}


/* =====================================================
   RENDER EVERYTHING
   ===================================================== */

function renderAll() {

    renderStats();

    renderMap();

    renderAmbulances();

    renderCalls();

    renderZones();

    renderDropdowns();

    renderDashboard();

    updateCounts();

    handleGlobalSearch();
}


/* =====================================================
   DASHBOARD STATISTICS
   ===================================================== */

function renderStats() {

    $("totalAmbulances").textContent =
        ambulances.length;

    $("availableAmbulances").textContent =
        ambulances.filter(
            a => a.status === "AVAILABLE"
        ).length;

    $("busyAmbulances").textContent =
        ambulances.filter(
            a => a.status === "BUSY"
        ).length;

    $("pendingCalls").textContent =
        calls.filter(
            c => c.status === "PENDING"
        ).length;
}


/* =====================================================
   AREA / ZONE NAME
   ===================================================== */

function area(zone) {

    if (!zone) {
        return "Unknown";
    }

    return zone.name;
}


/* =====================================================
   DISPATCH NETWORK
   ===================================================== */

function renderMap() {

    const svg = $("networkMap");

    if (!svg) {
        return;
    }

    if (!zones.length) {

        svg.innerHTML = `
            <text
                x="320"
                y="170"
                fill="#8393b2"
                text-anchor="middle">

                No service areas configured

            </text>
        `;

        return;
    }


    const positions = {};

    const count = zones.length;


    zones.forEach((zone, index) => {

        const angle =
            (2 * Math.PI * index) / count
            - Math.PI / 2;

        positions[zone.id] = {

            x:
                320 +
                235 *
                Math.cos(angle),

            y:
                170 +
                115 *
                Math.sin(angle)

        };

    });


    let output = "";

    const seenConnections =
        new Set();


    /* DRAW DISTANCE CONNECTIONS */

    distances.forEach(distance => {

        const from =
            positions[distance.fromZone?.id];

        const to =
            positions[distance.toZone?.id];


        if (!from || !to) {
            return;
        }


        if (
            distance.fromZone.id ===
            distance.toZone.id
        ) {
            return;
        }


        const key = [

            distance.fromZone.id,

            distance.toZone.id

        ]
            .sort()
            .join("-");


        if (seenConnections.has(key)) {
            return;
        }


        seenConnections.add(key);


        output += `

            <line

                x1="${from.x}"

                y1="${from.y}"

                x2="${to.x}"

                y2="${to.y}"

                stroke="#2a4068"

                stroke-width="1.5"

                stroke-dasharray="4 5">

            </line>

        `;


        output += `

            <text

                x="${(from.x + to.x) / 2}"

                y="${(from.y + to.y) / 2 - 5}"

                fill="#6f82a5"

                font-size="10"

                text-anchor="middle"

                font-family="JetBrains Mono">

                ${distance.distance} km

            </text>

        `;

    });


    /* DRAW ZONES */

    zones.forEach(zone => {

        const position =
            positions[zone.id];


        const pendingCalls =
            calls.filter(
                call =>
                    call.status === "PENDING" &&
                    call.callerZone?.id === zone.id
            ).length;


        if (pendingCalls > 0) {

            output += `

                <circle

                    class="pulse"

                    cx="${position.x}"

                    cy="${position.y}"

                    r="22"

                    fill="#fbbf24">

                </circle>

            `;

        }


        output += `

            <circle

                cx="${position.x}"

                cy="${position.y}"

                r="22"

                fill="#0d1629"

                stroke="${pendingCalls ? "#fbbf24" : "#4a6fa5"}"

                stroke-width="2">

            </circle>

        `;


        const zoneAmbulances =
            ambulances.filter(
                ambulance =>
                    ambulance.homeZone?.id === zone.id
            );


        zoneAmbulances
            .slice(0, 6)
            .forEach((ambulance, index) => {

                const angle =
                    (Math.PI * 2 * index) /
                    Math.max(
                        zoneAmbulances.length,
                        3
                    )
                    - Math.PI / 2;


                const color =
                    ambulance.status === "AVAILABLE"
                        ? "#2dd4bf"
                        : "#ff6b6b";


                output += `

                    <circle

                        cx="${
                    position.x +
                    10 *
                    Math.cos(angle)
                }"

                        cy="${
                    position.y +
                    10 *
                    Math.sin(angle)
                }"

                        r="4"

                        fill="${color}">

                    </circle>

                `;

            });


        output += `

            <text

                x="${position.x}"

                y="${position.y + 40}"

                fill="#e8edf7"

                font-size="12"

                font-weight="700"

                text-anchor="middle"

                font-family="Manrope">

                ${area(zone)}

            </text>

        `;

    });


    svg.innerHTML = output;
}


/* =====================================================
   STATUS BADGE
   ===================================================== */

function badge(status) {

    return `

        <span class="badge ${status.toLowerCase()}">

            ${status}

        </span>

    `;
}


function empty(message) {

    return `

        <p style="color:#8393b2">

            ${message}

        </p>

    `;
}


/* =====================================================
   AMBULANCE LIST
   ===================================================== */

function renderAmbulances() {

    const container =
        $("ambulanceList");

    if (!container) {
        return;
    }


    container.innerHTML =

        ambulances.length

            ?

            ambulances.map(
                ambulance => `

                <div class="card ${ambulance.status.toLowerCase()}">

                    <div class="card-top">

                        <span class="plate">

                            ${ambulance.vehicleNumber}

                        </span>

                        ${badge(ambulance.status)}

                    </div>


                    <div class="card-info">

                        Based in

                        <b>
                            ${area(ambulance.homeZone)}
                        </b>

                        <br>

                        Vehicle ID

                        <b class="mono">

                            #${ambulance.id}

                        </b>

                    </div>

                </div>

            `
            ).join("")

            :

            empty(
                "No ambulances registered."
            );
}


/* =====================================================
   EMERGENCY CALLS
   ===================================================== */

function renderCalls() {

    const container =
        $("callList");

    if (!container) {
        return;
    }


    container.innerHTML =

        calls.length

            ?

            calls
                .slice()
                .reverse()
                .map(call => {

                    const ambulance =
                        call.assignedAmbulance

                            ? call.assignedAmbulance
                                .vehicleNumber

                            : "Not assigned";


                    let action = "";


                    /* PENDING */

                    if (
                        call.status ===
                        "PENDING"
                    ) {

                        action = `

                            <button

                                class="card-action assign"

                                onclick="assignCall(${call.id})">

                                Assign nearest ambulance

                            </button>

                        `;

                    }


                    /* ASSIGNED */

                    else if (
                        call.status ===
                        "ASSIGNED"
                    ) {

                        action = `

                            <button

                                class="card-action complete"

                                onclick="completeCall(${call.id})">

                                Mark complete

                            </button>

                        `;

                    }


                    return `

                    <div class="card ${call.status.toLowerCase()}">

                        <div class="card-top">

                            <strong>

                                Emergency

                                <span class="mono">

                                    #${call.id}

                                </span>

                            </strong>

                            ${badge(call.status)}

                        </div>


                        <div class="card-info">

                            Caller

                            <b>
                                ${call.callerName}
                            </b>

                            <br>

                            Phone

                            <b class="mono">

                                ${call.phoneNumber}

                            </b>

                            <br>

                            Location

                            <b>

                                ${area(call.callerZone)}

                            </b>

                            <br>

                            Ambulance

                            <b>

                                ${ambulance}

                            </b>

                        </div>


                        ${action}

                    </div>

                    `;

                })
                .join("")

            :

            empty(
                "No emergency calls registered."
            );
}


/* =====================================================
   SERVICE AREAS
   ===================================================== */

function renderZones() {

    const container =
        $("zoneList");

    if (!container) {
        return;
    }


    container.innerHTML =

        zones.length

            ?

            zones.map(zone => {

                const connections =
                    distances
                        .filter(
                            distance =>
                                distance.fromZone?.id === zone.id &&
                                distance.toZone?.id !== zone.id
                        )
                        .slice(0, 5);


                const connectionHTML =
                    connections.length

                        ?

                        connections
                            .map(
                                distance => `

                                <div>

                                    ${area(
                                    distance.toZone
                                )}

                                    <b class="mono">

                                        ${distance.distance} km

                                    </b>

                                </div>

                            `
                            )
                            .join("")

                        :

                        "No nearby connections configured";


                const ambulanceCount =
                    ambulances.filter(
                        ambulance =>
                            ambulance.homeZone?.id === zone.id
                    ).length;


                return `

                <div class="card">

                    <div class="card-top">

                        <span class="plate">

                            ${area(zone)}

                        </span>

                        <span class="badge assigned">

                            ${ambulanceCount}
                            vehicles

                        </span>

                    </div>


                    <div class="route">

                        ${connectionHTML}

                    </div>

                </div>

                `;

            }).join("")

            :

            empty(
                "No service areas configured."
            );
}


/* =====================================================
   ZONE DROPDOWNS
   ===================================================== */

function renderDropdowns() {

    const ambulanceZone =
        $("ambulanceZone");

    const callerZone =
        $("callerZone");


    if (!ambulanceZone || !callerZone) {
        return;
    }


    const options =
        zones
            .map(
                zone => `

                <option value="${zone.id}">

                    ${area(zone)}

                </option>

            `
            )
            .join("");


    ambulanceZone.innerHTML = `

        <option value="">

            Home area

        </option>

        ${options}

    `;


    callerZone.innerHTML = `

        <option value="">

            Caller location

        </option>

        ${options}

    `;
}


/* =====================================================
   DASHBOARD FLEET
   ===================================================== */

function renderDashboard() {

    const dashboardAmbulances =
        $("dashboardAmbulances");

    const dashboardCalls =
        $("dashboardCalls");


    if (!dashboardAmbulances ||
        !dashboardCalls) {

        return;
    }


    dashboardAmbulances.innerHTML =

        ambulances.length

            ?

            ambulances
                .slice(0, 6)
                .map(
                    ambulance => `

                    <div class="mini-item">

                        <div>

                            <strong class="mono">

                                ${ambulance.vehicleNumber}

                            </strong>

                            <br>

                            <small>

                                ${area(
                        ambulance.homeZone
                    )}

                            </small>

                        </div>

                        ${badge(
                        ambulance.status
                    )}

                    </div>

                `
                )
                .join("")

            :

            empty(
                "No ambulances registered."
            );


    dashboardCalls.innerHTML =

        calls.length

            ?

            calls
                .slice()
                .reverse()
                .slice(0, 5)
                .map(
                    call => `

                    <div class="mini-item">

                        <div>

                            <strong>

                                ${call.callerName}

                            </strong>

                            <br>

                            <small>

                                ${area(
                        call.callerZone
                    )}

                            </small>

                        </div>

                        ${badge(
                        call.status
                    )}

                    </div>

                `
                )
                .join("")

            :

            empty(
                "No emergency calls."
            );
}


/* =====================================================
   COLLAPSIBLE PANELS
   ===================================================== */

function togglePanel(id, button) {

    const panel =
        $(id);

    if (!panel) {
        return;
    }


    const isOpen =
        panel.classList.contains("open");


    if (isOpen) {

        panel.classList.remove("open");

        button.classList.remove("open");

    } else {

        panel.classList.add("open");

        button.classList.add("open");

    }
}


/* =====================================================
   SECTION COUNTS
   ===================================================== */

function updateCounts() {

    const ambulanceCount =
        $("ambulanceCount");

    const callCount =
        $("callCount");

    const zoneCount =
        $("zoneCount");


    if (ambulanceCount) {

        ambulanceCount.textContent =
            `${ambulances.length} total`;

    }


    if (callCount) {

        callCount.textContent =
            `${calls.length} total`;

    }


    if (zoneCount) {

        zoneCount.textContent =
            `${zones.length} areas`;

    }
}


/* =====================================================
   GLOBAL SEARCH
   ===================================================== */

function handleGlobalSearch() {

    const input =
        $("globalSearch");

    const resultsBox =
        $("searchResults");


    if (!input || !resultsBox) {
        return;
    }


    const query =
        input.value
            .trim()
            .toLowerCase();


    if (!query) {

        resultsBox.innerHTML = "";

        resultsBox.classList.remove(
            "show"
        );

        window.currentSearchResults = [];

        return;
    }


    const results = [];


    /* ---------------------------------------------
       SEARCH AMBULANCES
       --------------------------------------------- */

    ambulances.forEach(
        (ambulance, index) => {

            const vehicle =
                ambulance.vehicleNumber
                    ?.toLowerCase() || "";


            const status =
                ambulance.status
                    ?.toLowerCase() || "";


            const zone =
                area(ambulance.homeZone)
                    .toLowerCase();


            if (
                vehicle.includes(query) ||
                status.includes(query) ||
                zone.includes(query)
            ) {

                results.push({

                    type:
                        "Ambulance",

                    title:
                    ambulance.vehicleNumber,

                    info:
                        `${area(
                            ambulance.homeZone
                        )} • ${
                            ambulance.status
                        }`,

                    section:
                        "ambulances",

                    index:
                    index

                });

            }

        }
    );


    /* ---------------------------------------------
       SEARCH EMERGENCY CALLS
       --------------------------------------------- */

    calls.forEach(
        (call, index) => {

            const caller =
                call.callerName
                    ?.toLowerCase() || "";


            const phone =
                call.phoneNumber
                    ?.toLowerCase() || "";


            const status =
                call.status
                    ?.toLowerCase() || "";


            const zone =
                area(call.callerZone)
                    .toLowerCase();


            if (
                caller.includes(query) ||
                phone.includes(query) ||
                status.includes(query) ||
                zone.includes(query)
            ) {

                results.push({

                    type:
                        "Emergency Call",

                    title:
                        `${call.callerName} #${call.id}`,

                    info:
                        `${area(
                            call.callerZone
                        )} • ${
                            call.status
                        }`,

                    section:
                        "calls",

                    index:
                    index

                });

            }

        }
    );


    /* ---------------------------------------------
       SEARCH SERVICE AREAS
       --------------------------------------------- */

    zones.forEach(
        (zone, index) => {

            const name =
                area(zone)
                    .toLowerCase();


            if (
                name.includes(query)
            ) {

                results.push({

                    type:
                        "Service Area",

                    title:
                        area(zone),

                    info:
                        `Zone ID ${zone.id}`,

                    section:
                        "zones",

                    index:
                    index

                });

            }

        }
    );


    /* ---------------------------------------------
       LIMIT RESULTS
       --------------------------------------------- */

    const visibleResults =
        results.slice(0, 8);


    window.currentSearchResults =
        visibleResults;


    if (!visibleResults.length) {

        resultsBox.innerHTML = `

            <div class="search-empty">

                No matching records found

            </div>

        `;

        resultsBox.classList.add(
            "show"
        );

        return;
    }


    resultsBox.innerHTML =
        visibleResults
            .map(
                (result, resultIndex) => `

                <button

                    class="search-result"

                    onclick="
                        openSearchResult(
                            ${resultIndex}
                        )
                    ">

                    <span class="search-result-type">

                        ${result.type}

                    </span>

                    <strong>

                        ${result.title}

                    </strong>

                    <small>

                        ${result.info}

                    </small>

                </button>

            `
            )
            .join("");


    resultsBox.classList.add(
        "show"
    );
}


/* =====================================================
   OPEN SEARCH RESULT
   ===================================================== */

function openSearchResult(
    resultIndex
) {

    const result =
        window.currentSearchResults?.[
            resultIndex
            ];


    if (!result) {
        return;
    }


    showSection(
        result.section
    );


    const resultsBox =
        $("searchResults");

    resultsBox.classList.remove(
        "show"
    );


    $("globalSearch").value = "";


    setTimeout(() => {

        const containerMap = {

            ambulances:
                "ambulanceList",

            calls:
                "callList",

            zones:
                "zoneList"

        };


        const container =
            $(
                containerMap[
                    result.section
                    ]
            );


        if (!container) {
            return;
        }


        const cards =
            container.querySelectorAll(
                ".card"
            );


        let cardIndex =
            result.index;


        /*
           Calls are displayed in reverse
           order, so we adjust the index.
        */

        if (
            result.section ===
            "calls"
        ) {

            cardIndex =
                calls.length -
                1 -
                result.index;

        }


        const card =
            cards[cardIndex];


        if (!card) {
            return;
        }


        card.scrollIntoView({

            behavior:
                "smooth",

            block:
                "center"

        });


        card.classList.add(
            "search-highlight"
        );


        setTimeout(
            () => {

                card.classList.remove(
                    "search-highlight"
                );

            },

            2200
        );


    }, 100);
}


/* =====================================================
   CLEAR SEARCH
   ===================================================== */

function clearGlobalSearch() {

    const input =
        $("globalSearch");

    const resultsBox =
        $("searchResults");


    if (input) {

        input.value = "";

    }


    if (resultsBox) {

        resultsBox.innerHTML = "";

        resultsBox.classList.remove(
            "show"
        );

    }


    window.currentSearchResults = [];
}


/* =====================================================
   SEND REQUEST TO BACKEND
   ===================================================== */

async function send(
    url,
    method,
    body,
    successMessage,
    failureMessage
) {

    try {

        const response =
            await fetch(
                url,
                {

                    method:
                    method,

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body:
                        body
                            ? JSON.stringify(body)
                            : null

                }
            );


        const message =
            await response.text();


        if (!response.ok) {

            showToast(
                message ||
                failureMessage
            );

            return false;
        }


        showToast(
            successMessage ||
            message
        );


        await loadData(true);

        return true;

    }

    catch (error) {

        console.error(error);

        showToast(
            failureMessage
        );

        return false;
    }
}


/* =====================================================
   ADD AMBULANCE
   ===================================================== */

async function addAmbulance() {

    const vehicle =
        $("vehicleNumber")
            .value
            .trim();


    const zone =
        $("ambulanceZone")
            .value;


    const status =
        $("ambulanceStatus")
            .value;


    if (!vehicle || !zone) {

        showToast(
            "Enter vehicle number and home area"
        );

        return;
    }


    const success =
        await send(

            "/ambulances",

            "POST",

            {

                vehicleNumber:
                vehicle,

                homeZone: {

                    id:
                        Number(zone)

                },

                status:
                status

            },

            "Ambulance registered",

            "Unable to register ambulance"

        );


    if (success) {

        $("vehicleNumber")
            .value = "";

    }
}


/* =====================================================
   CREATE EMERGENCY CALL
   ===================================================== */

async function addCall() {

    const caller =
        $("callerName")
            .value
            .trim();


    const phone =
        $("phoneNumber")
            .value
            .trim();


    const zone =
        $("callerZone")
            .value;


    if (
        !caller ||
        !phone ||
        !zone
    ) {

        showToast(
            "Complete all emergency call details"
        );

        return;
    }


    const success =
        await send(

            "/calls",

            "POST",

            {

                callerName:
                caller,

                phoneNumber:
                phone,

                callerZone: {

                    id:
                        Number(zone)

                }

            },

            "Emergency call registered",

            "Unable to create emergency call"

        );


    if (success) {

        $("callerName")
            .value = "";

        $("phoneNumber")
            .value = "";

    }
}


/* =====================================================
   ASSIGN NEAREST AMBULANCE
   ===================================================== */

function assignCall(id) {

    return send(

        `/calls/${id}/assign`,

        "PUT",

        null,

        "Nearest available ambulance assigned",

        "Assignment failed"

    );
}


/* =====================================================
   COMPLETE EMERGENCY CALL
   ===================================================== */

function completeCall(id) {

    return send(

        `/calls/${id}/complete`,

        "PUT",

        null,

        "Call completed and ambulance available",

        "Unable to complete call"

    );
}


/* =====================================================
   ADD SERVICE AREA
   ===================================================== */

async function addZone() {

    const name =
        $("zoneName")
            .value
            .trim();


    const id =
        $("zoneId")
            .value;


    if (!name || !id) {

        showToast(
            "Enter an area ID and name"
        );

        return;
    }


    const success =
        await send(

            "/zones",

            "POST",

            {

                id:
                    Number(id),

                name:
                name

            },

            "Service area added",

            "Unable to add service area"

        );


    if (success) {

        $("zoneName")
            .value = "";

        $("zoneId")
            .value = "";

    }
}


/* =====================================================
   NAVIGATION
   ===================================================== */

function showSection(id) {

    document
        .querySelectorAll(".section")
        .forEach(
            section => {

                section.classList.remove(
                    "active"
                );

            }
        );


    const selected =
        $(id);


    if (!selected) {
        return;
    }


    selected.classList.add(
        "active"
    );


    document
        .querySelectorAll(".nav-btn")
        .forEach(
            button => {

                button.classList.toggle(

                    "active",

                    button.dataset.section === id

                );

            }
        );


    const titles = {

        dashboard:
            "Dispatch dashboard",

        ambulances:
            "Ambulance fleet",

        calls:
            "Emergency operations",

        zones:
            "Service areas"

    };


    $("pageTitle").textContent =
        titles[id];
}


/* =====================================================
   TOAST MESSAGE
   ===================================================== */

let toastTimer;


function showToast(message) {

    const toast =
        $("toast");


    if (!toast) {
        return;
    }


    toast.textContent =
        message;


    toast.style.display =
        "block";


    clearTimeout(
        toastTimer
    );


    toastTimer =
        setTimeout(

            () => {

                toast.style.display =
                    "none";

            },

            3000

        );
}


/* =====================================================
   CLOCK
   ===================================================== */

setInterval(
    () => {

        const clock =
            $("clock");


        if (clock) {

            clock.textContent =
                new Date()
                    .toLocaleTimeString();

        }

    },

    1000
);


/* =====================================================
   INITIAL LOAD
   ===================================================== */

loadData(true);