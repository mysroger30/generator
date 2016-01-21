if [[ $# -lt 2 ]] ; then
    echo 'generate [project] [output]'
    exit 0
fi

if [ -d "tmp" ]; then
    rm -r "tmp"
fi
mkdir "tmp"

jq -f sanitize.jq "data/$1/database.json" | jq -f process.jq > tmp/processed.json

numq=$(($(jq "length" tmp/processed.json) - 1))

seq 0 $numq | parallel jq '.[{}]' tmp/processed.json '>' tmp/{}

seq 0 $numq | parallel mustache tmp/{} template/question.mustache '>' tmp/{}.html

if [ -d "$2" ]; then
    rm -r "$2"
fi
mkdir "$2"
mkdir "$2/fragor"

for i in $(seq 0 $numq)
do
    file_name="$(cat "tmp/$i" | jq -r ".stem" | sed -e 's/\(.*\)/\L\1/' | sed 'y/åäö /aao-/' | sed "s/[^[:alpha:]-]/-/g")"
    file_name="$(echo $file_name | sed 's/--*/-/g' | cut -c 1-50).html"
    
    mkdir "$2/fragor/$i"
    cp "tmp/$i.html" "$2/fragor/$i/$file_name"
done

cp -r "data/$1/images" "$2/"

cp -r "template/css" "$2/"

mkdir "$2/js"
cat "template/js/index.js" "data/$1/database.json" > "$2/js/index.js"

cp "template/index.mustache" "$2/index.html"
