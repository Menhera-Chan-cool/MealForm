import { responseMealDetails } from './dashboard-model.mjs';

export default function ResponseMeals({ response, week }) {
  return <dl className="response-meals">{responseMealDetails(response, week).map(({ day, meal }, i) => <div key={i}><dt>{day}</dt><dd>{meal}</dd></div>)}</dl>;
}
