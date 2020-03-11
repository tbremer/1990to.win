const data = require('../../data.json');
const states = new Map([
  [
    'iowa',
    {
      date: '02/03/2020',
      candidates: [],
    },
  ],
  [
    'new-hampshire',
    {
      date: '02/11/2020',
      candidates: [],
    },
  ],
  [
    'nevada',
    {
      date: '02/22/2020',
      candidates: [],
    },
  ],
  [
    'south-carolina',
    {
      date: '02/29/2020',
      candidates: [],
    },
  ],
  [
    'american-samoa',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'alabama',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'arkansas',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'california',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'colorado',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'maine',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'massachusetts',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'minnesota',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'north-carolina',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'oklahoma',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'tennessee',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'texas',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'utah',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'vermont',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'virginia',
    {
      date: '03/03/2020',
      candidates: [],
    },
  ],
  [
    'idaho',
    {
      date: '03/10/2020',
      candidates: [],
    },
  ],
  [
    'michigan',
    {
      date: '03/10/2020',
      candidates: [],
    },
  ],
  [
    'mississippi',
    {
      date: '03/10/2020',
      candidates: [],
    },
  ],
  [
    'missouri',
    {
      date: '03/10/2020',
      candidates: [],
    },
  ],
  [
    'north-dakota',
    {
      date: '03/10/2020',
      candidates: [],
    },
  ],
  [
    'washington',
    {
      date: '03/10/2020',
      candidates: [],
    },
  ],
]);

for (const candidate in data) {
  if (!Object.prototype.hasOwnProperty.call(data, candidate)) continue;
  data[candidate].projection.forEach(i =>
    states.get(i.state).candidates.push([candidate, i.count, 'projection'])
  );

  data[candidate].delegates.forEach(i =>
    states.get(i.state).candidates.push([candidate, i.count, 'delegate'])
  );
}

module.exports = states;
