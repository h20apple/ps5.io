"use strict";

const output = document.getElementById("output");
const runButton = document.getElementById("run");


function testLocalStorage() {

    try {

        const key = "__ps5_safe_test__";

        localStorage.setItem(key, "1");

        const value =
            localStorage.getItem(key);

        localStorage.removeItem(key);

        return value === "1";

    } catch (error) {

        return false;
    }
}


function testTypedArrays() {

    try {

        const array =
            new Uint32Array(1024);

        for (
            let i = 0;
            i < array.length;
            i++
        ) {

            array[i] =
                (i * 2654435761) >>> 0;
        }

        let checksum = 0;

        for (
            let i = 0;
            i < array.length;
            i++
        ) {

            checksum =
                (checksum ^ array[i]) >>> 0;
        }

        return {
            success: true,
            checksum:
                "0x" + checksum.toString(16)
        };

    } catch (error) {

        return {
            success: false,
            error: String(error)
        };
    }
}


async function testWebAssembly() {

    if (
        typeof WebAssembly !== "object"
    ) {

        return {
            available: false
        };
    }

    try {

        /*
         * Minimal valid WebAssembly module.
         *
         * This only tests whether normal WebAssembly
         * compilation is available.
         */

        const moduleBytes =
            new Uint8Array([
                0x00,
                0x61,
                0x73,
                0x6d,
                0x01,
                0x00,
                0x00,
                0x00
            ]);

        await WebAssembly.compile(
            moduleBytes
        );

        return {
            available: true,
            compile: true
        };

    } catch (error) {

        return {
            available: true,
            compile: false,
            error: String(error)
        };
    }
}


async function runTest() {

    runButton.disabled = true;

    output.textContent =
        "Running tests...\n";

    const started =
        new Date().toISOString();


    const report = {

        testName:
            "PS5 13.60 WebKit Safe Test",

        startedAtUTC:
            started,

        completedAtUTC:
            null,

        exploitExecuted:
            false,

        kernelAccessAttempted:
            false,

        persistenceAttempted:
            false,

        psnAccessAttempted:
            false,

        results: {

            userAgent:
                navigator.userAgent,

            platform:
                navigator.platform || "unreported",

            language:
                navigator.language || "unreported",

            cookieEnabled:
                navigator.cookieEnabled,

            localStorage:
                testLocalStorage(),

            fetch:
                typeof fetch === "function",

            promises:
                typeof Promise === "function",

            workers:
                typeof Worker === "function",

            serviceWorkerAPI:
                "serviceWorker" in navigator,

            indexedDB:
                "indexedDB" in window,

            crypto:
                !!window.crypto,

            webAssembly:
                await testWebAssembly(),

            typedArrays:
                testTypedArrays()
        }
    };


    report.completedAtUTC =
        new Date().toISOString();


    try {

        const response =
            await fetch(
                "/api/result",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body:
                        JSON.stringify(report)
                }
            );


        report.serverRecorded =
            response.ok;

    } catch (error) {

        report.serverRecorded =
            false;

        report.serverError =
            String(error);
    }


    output.textContent =
        JSON.stringify(
            report,
            null,
            2
        );


    runButton.disabled = false;
}


runButton.addEventListener(
    "click",
    runTest
);