[
.[] += {numq: (. | length)}
| to_entries
| .[] | .value += {number: (.key + 1)}
| .value
| .options[] |= {text: ., correct: false}
| .options[.key].correct = true
| . + {title: .stem}
| if (.title | length) > 80 then (.title = .title[0:80] | .title += "...") else . end
| . + {answer: .options[.key].text}
]