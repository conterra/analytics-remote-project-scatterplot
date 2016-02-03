define({
    bundleName: "Scatter Dashboard",
    bundleDescription: "Stellt eine Beispielkonfiguration f\u00FCr ein service.monitor Analytics Dashboard und ein Scatter-Plot-Widget bereit.",

    dashboards: {
        scatter: {
            "title": "Scatter Plot: View Port"
        }
    },
    quickSelects: {
        device: {
            "default": "Alle Plattformen",
            "title": "Plattform"
        },
        mobile_device: {
            "default": "Alle Ger\u00e4te",
            "title": "Ger\u00e4te"
        },
        time: {
            "default": "Keine zeitliche Einschr\u00e4nkung",
            "title": "Zeit"
        }
    },
    separators: {
        quickSelect: {"title": "Filter"},
        client: {
            "title": "Laufzeitumgebung der Clients",
            "text": "Übersicht verschiedener Aspekte der Laufzeitumgebung auf dem Endgerät des Nutzers."
        }
    },
    widgets: {
        "viewportScatter": {
                "title": "Verteilung der Viewports",
                "xAxis": "Breite (Pixel)",
                "yAxis": "Höhe (Pixel)"
            }
    }
});