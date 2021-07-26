---
title: Is the Telemetry Data Platform still on AWS?
scripts:
  - https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.22.2/moment.min.js
imports:
  - /examples/plotlyjs.md#Plotly
data:
  - data_migration_gcp_heka: https://bugzilla.mozilla.org/rest/bug?blocks=1579435&include_fields=id,last_change_time,status,creation_time
  - data_migration_gcp_query: https://bugzilla.mozilla.org/rest/bug?blocks=1560158&include_fields=id,last_change_time,status,creation_time
  - data_migration_gcp_misc: https://bugzilla.mozilla.org/rest/bug?blocks=1594101&include_fields=id,last_change_time,status,creation_time
  - data_migration_gcp_spark: https://bugzilla.mozilla.org/rest/bug?blocks=1570610&include_fields=id,last_change_time,status,creation_time
---

# {title}

## Overall progress

<Plotly data={allBugs} />

This track the total number of outstanding bugs under the categories below: it is meant to track our overall progress. See also the [AWS inventory spreadsheet](https://docs.google.com/spreadsheets/d/1f6fVsEp8FaX6ri98benHexzsHWYU9HMEbNW1poJQd1w/edit#gid=0) which we are using to
track due dates.

## Heka tasks

<Plotly data={hekaCounts} />

This covers tasks related to decomissioning the heka data lake ([metabug data-migration-gcp-data-lake](https://bugzilla.mozilla.org/show_bug.cgi?id=data-migration-gcp-data-lake))

## Spark tasks

<Plotly data={sparkCounts} />

This covers tasks related to scheduled spark jobs ([metabug data-migration-gcp-spark](https://bugzilla.mozilla.org/show_bug.cgi?id=data-migration-gcp-spark))

## Query migration tasks

<Plotly data={queryCounts} />

This covers tasks related to the query migration ([metabug data-migration-gcp-query](https://bugzilla.mozilla.org/show_bug.cgi?id=data-migration-gcp-query)). For fine-grained information on the status of migrating the queries themselves, see the [the athena presto to bigquery migration dashboard](https://sql.telemetry.mozilla.org/dashboard/athena-presto-to-bigquery-migration).

## Miscellaneous tasks

<Plotly data={miscCounts} />

This covers tasks outside that don't fall into any of the other tracks ([metabug data-migration-gcp-misc](https://bugzilla.mozilla.org/show_bug.cgi?id=data-migration-gcp-misc))

```{code-cell} js
---
id: getGroupedBugCounts
---

var getGroupedBugCounts = (bugs) => {
	bugs = bugs
    	.map(b=> ({...b,
                  creation_time: b.creation_time.slice(0, 10),
                  last_change_time: b.last_change_time.slice(0,10)}))
	let creationTimes = bugs.map(b => b.creation_time)
	let lastChangeTimes = bugs.map(b => b.last_change_time)
	let start = new Date('2019-11-05');
	let end = moment(new Date()).add(1, 'days');

	let currentTime = moment(start);
	const open = { name: 'Unresolved', stackgroup: 'one', x: [], y: [] }
	const resolved = { name: 'Resolved', stackgroup: 'one', x: [], y: []}
  	while (currentTime <= end) {
      let openBugs = bugs.filter(bug => moment(bug.creation_time) <= currentTime);
	  let resolvedBugs = openBugs.filter(
        bug => moment(bug.last_change_time) <= currentTime && (bug.status === 'RESOLVED' || bug.status === 'VERIFIED'))
	  open.x.push(new Date(currentTime));
	  open.y.push(openBugs.length  - resolvedBugs.length)
	  resolved.x.push(new Date(currentTime));
	  resolved.y.push(resolvedBugs.length);
      currentTime = currentTime.add(1, 'days')
    }
  	return [open, resolved];
}

return getGroupedBugCounts;
```

```{code-cell} js
---
id: "hekaCounts"
inputs: ["getGroupedBugCounts", "data_migration_gcp_heka"]
---

return getGroupedBugCounts(data_migration_gcp_heka.bugs)
```

```{code-cell} js
---
id: "queryCounts"
inputs: ["getGroupedBugCounts", "data_migration_gcp_query"]
---

return getGroupedBugCounts(data_migration_gcp_query.bugs)
```

```{code-cell} js
---
id: "miscCounts"
inputs: ["getGroupedBugCounts", "data_migration_gcp_misc"]
---

return getGroupedBugCounts(data_migration_gcp_misc.bugs)
```

```{code-cell} js
---
id: "sparkCounts"
inputs: ["getGroupedBugCounts", "data_migration_gcp_spark"]
---

return getGroupedBugCounts(data_migration_gcp_spark.bugs)
```

```{code-cell} js
---
id: "allBugs"
inputs: ["sparkCounts", "miscCounts", "queryCounts", "hekaCounts"]
---

return [
{ ...hekaCounts[0], name: 'heka'},
{ ...queryCounts[0], name: 'query'},
{ ...sparkCounts[0], name: 'spark'},
{ ...miscCounts[0], name: 'misc'}
];
```
