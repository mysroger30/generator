if [[ $# -lt 1 ]] ; then
    echo 'generate [project]'
    exit 0
fi

tmp_dir="tmp"
project_name="$1"
out_dir="$project_name-out"
out_dir_questions=$(cat "data/$project_name/conf.json" | jq -r ".questionDirectory")

if [ -d "$tmp_dir" ]; then
    rm -r "$tmp_dir"
fi
mkdir "$tmp_dir"

jq -f sanitize.jq "data/$project_name/database.json" | jq -f process.jq > "$tmp_dir/processed.json"

numq=$(($(jq "length" "$tmp_dir/processed.json") - 1))

seq 0 $numq | parallel jq '.[{}]' "$tmp_dir/processed.json" '>' "$tmp_dir/{}.json"
for i in $(seq 0 $numq)
do
    cat "data/$project_name/conf.json" "$tmp_dir/$i.json" | jq --slurp ".[0] + .[1]" > "$tmp_dir/$i-merged.json"
done

seq 0 $numq | parallel mustache "$tmp_dir/{}-merged.json" template/question.mustache '>' "$tmp_dir/{}.html"

if [ -d "$out_dir" ]; then
    rm -r "$out_dir"
fi
mkdir "$out_dir"
mkdir "$out_dir/$out_dir_questions"

for i in $(seq 0 $numq)
do
    file_name="$(cat "$tmp_dir/$i.json" | jq -r '.url')"

    mkdir "$out_dir/$out_dir_questions/$i"
    cp "$tmp_dir/$i.html" "$out_dir/$out_dir_questions/$i/$file_name.html"
done

cp -r "data/$project_name/images" "$out_dir/"

cp -r "template/css" "$out_dir/"

mkdir "$out_dir/js"
cat "template/js/index.js" "data/$project_name/database.json" > "$out_dir/js/index.js"

mustache "data/$project_name/conf.json" "template/index.mustache" > "$out_dir/index.html"

mustache "data/$project_name/conf.json" "template/links.mustache" > "$tmp_dir/links.html"
cat tmp/processed.json | jq -r -f links.jq > "$tmp_dir/links"
sed -e "/%LINKS%/{
r $tmp_dir/links
d}" "$tmp_dir/links.html" > "$out_dir/$out_dir_questions/index.html"
