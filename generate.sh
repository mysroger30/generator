if [[ $# -lt 1 ]] ; then
    echo 'generate [project]'
    exit 0
fi

tmp_dir="tmp"
project_name="$1"
out_dir="$project_name-out"
out_dir_questions="fragor"

if [ -d "$tmp_dir" ]; then
    rm -r "$tmp_dir"
fi
mkdir "$tmp_dir"

jq -f sanitize.jq "data/$project_name/database.json" | jq -f process.jq > "$tmp_dir/processed.json"

numq=$(($(jq "length" "$tmp_dir/processed.json") - 1))

seq 0 $numq | parallel jq '.[{}]' "$tmp_dir/processed.json" '>' "$tmp_dir/{}"

seq 0 $numq | parallel mustache "$tmp_dir/{}" template/question.mustache '>' "$tmp_dir/{}.html"

if [ -d "$out_dir" ]; then
    rm -r "$out_dir"
fi
mkdir "$out_dir"
mkdir "$out_dir/$out_dir_questions"

for i in $(seq 0 $numq)
do
    file_name="$(cat "$tmp_dir/$i" | jq -r '.url')"

    mkdir "$out_dir/$out_dir_questions/$i"
    cp "$tmp_dir/$i.html" "$out_dir/$out_dir_questions/$i/$file_name.html"
done

cp -r "data/$project_name/images" "$out_dir/"

cp -r "template/css" "$out_dir/"

mkdir "$out_dir/js"
cat "template/js/index.js" "data/$project_name/database.json" > "$out_dir/js/index.js"

cp "template/index.mustache" "$out_dir/index.html"

cat tmp/processed.json | jq -r -f links.jq > "$tmp_dir/links"
sed -e "/%LINKS%/{
r $tmp_dir/links
d}" "template/links.html" > "$out_dir/$out_dir_questions/index.html"
