define({
    root: {
        bundleName: "Scatter Dashboard",
        bundleDescription: "Provides a sample configuration for a service.monitor Analytics dashboard and a scatter plot widget widgets.",
        dashboards: {
            scatter: {
                "title": "Scatter Plot: View Port"
            }
        },
        quickSelects: {
            time: {
                "default": "No temporal restrictions",
                "title": "Time"
            },
            device: {
                "default": "All platforms",
                "title": "Platform"
            },
            mobile_device: {
                "default": "All devices",
                "title": "Device"
            }
        },
        separators: {
            quickSelect: {"title": "Filter"},
            client: {"title": "Technical basic conditions of your clients","text":"Overview of technical, contextual parameters."}
        },
        widgets: {
            "viewportScatter": {
                "title": "View Resolution",
                "xAxis": "Width (Pixels)",
                "yAxis": "Height (Pixels)"
            }
        }
    },
    "de": true
});