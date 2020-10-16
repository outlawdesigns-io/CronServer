#!/bin/bash

#I am a gist.
#Get me in your dockerfile.
#provide creds
#store token and only refresh when necessary

_post_to_api(){
  TOKEN=$1
  JOBID=$2
  STARTTIME=$3
  ENDTIME=$4
  OUTPUT=$5
  #curl -d '{id:'$JOBID'}' -H 'Content-Type: application/json' localhost/test.php
  curl -d jobId="$JOBID" -d startTime="$STARTTIME" -d endTime="$ENDTIME" -d output="$OUTPUT" localhost/test.php
}
_tokenRequest(){
  TOKEN=$(curl -H "request_token:$1" -H "password:$2" https://api.outlawdesigns.io:9661/authenticate | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
  echo $TOKEN
}
_validateToken(){
  ERRORFILE="verify_error"
  if test -f $ERRORFILE; then
    rm "$ERRORFILE"
  fi
  TOKEN=$(curl -H "auth_token:"$1 https://api.outlawdesigns.io:9661/verify | python3 -c "import sys,json; print(json.load(sys.stdin)['auth_token'])" 2>"$ERRORFILE")
  if test -s "$ERRORFILE"; then
    echo "FALSE"
  else
    echo $TOKEN
  fi
}

TOKENFILE="access_token"
CREDFILE="creds"
USER=$(sed '1,1!d' "$CREDFILE")
PASS=$(sed '2,2!d' "$CREDFILE")
STARTTIME=$(date)
JOBID=$1
CMD=$2
OUTFILE=$3

if test -f "$TOKENFILE" && [ $(_validateToken $(cat $TOKENFILE)) != "FALSE" ]
then
  echo "Token is good. Using stored token...\n"
  TOKEN=$(cat $TOKENFILE)
else
  echo "Token is bad. Requesting new token..\n"
  _tokenRequest $USER $PASS > $TOKENFILE
  TOKEN=$(cat $TOKENFILE)
fi

echo "Evaluating command...\n"

eval $CMD > $OUTFILE 2>&1
OUTPUT=$(cat $OUTFILE)
ENDTIME=$(date)
_post_to_api "$TOKEN" "$JOBID" "$STARTTIME" "$ENDTIME" "$OUTPUT"
