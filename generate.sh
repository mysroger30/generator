if [[ $# -lt 2 ]] ; then
    echo 'generate [database] [output]'
    exit 0
fi

if [ -d "tmp" ]; then
    rm -r "tmp"
fi
mkdir "tmp"

jq -f sanitize.jq "$1" | jq -f process.jq > tmp/processed.json

numq=$(($(jq "length" tmp/processed.json) - 1))

seq 0 $numq | parallel jq '.[{}]' tmp/processed.json '>' tmp/{}

seq 0 $numq | parallel mustache tmp/{} template/question.mustache '>' tmp/{}.html

if [ -d "$2" ]; then
    rm -r "$2"
fi
mkdir "$2"

for i in $(seq 0 $numq)
do
    file_name="$(cat "tmp/$i" | jq -r ".stem" | sed -e 's/\(.*\)/\L\1/' | sed 'y/åäö /aao-/' | sed "s/[^[:alpha:]-]/-/g")"
    file_name="$(echo $file_name | sed 's/--*/-/g' | cut -c 1-50).html"
    
    mkdir "$2/$i"
    cp "tmp/$i.html" "$2/$i/$file_name"
done
