#----------------------------------------------------
# map.apps REMOTE project
#
#  This project requires a remote or local
#  installation of map.apps!
#
#  The default remote installation is expected at:
#      http://www.mapapps.de/mapapps
#----------------------------------------------------

# Pre Conditions
#----------------------------------------------------

Copy all libs in the "software/m2repository" folder of your map.apps distribution
into your local maven repository (${user.home}/.m2/repository).

# MVN Goals
#----------------------------------------------------

# Start jetty at http://localhost:9090 for local implementation.
mvn jetty:run

# build uncompressed jar and app template
mvn install

# build uncompressed jar and app template and upload them to the remote map.apps installation
mvn clean install -P upload

# build compressed jar and app template
mvn clean install -P compress

# build compressed jar and app template and upload them to the remote map.apps installation
mvn clean install -P compress,upload

# URLs (after jetty:run goal)
#----------------------------------------------------

# Base App
http://localhost:9090

# Embedded JS Registry
http://localhost:9090/resources/jsregistry/root

# Open Tests in Browser
http://localhost:9090/js/tests/runTests.html