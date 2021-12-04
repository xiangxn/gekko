#!/bin/bash
# export http_proxy="http://192.168.0.104:8001"
# export HTTP_PROXY="http://192.168.0.104:8001" 
# export https_proxy="http://192.168.0.104:8001"
# export HTTPS_PROXY="http://192.168.0.104:8001"

sed -i 's/127.0.0.1/0.0.0.0/g' /usr/src/app/web/vue/dist/UIconfig.js
sed -i 's/localhost/'${HOST}'/g' /usr/src/app/web/vue/dist/UIconfig.js
sed -i 's/3000/'${PORT}'/g' /usr/src/app/web/vue/dist/UIconfig.js
if [[ "${USE_SSL:-0}" == "1" ]] ; then
    sed -i 's/ssl: false/ssl: true/g' /usr/src/app/web/vue/dist/UIconfig.js
fi
exec node gekko "$@"
