import { responseMealDetails } from './dashboard-model.mjs';
import DayLabel from './DayLabel.jsx';

export default function ResponseMeals({ response, week }) {
  return <dl className="response-meals">{responseMealDetails(response, week).map(({ day, meal }, i) => <div key={i}><dt><DayLabel label={day}/></dt><dd>{meal}</dd></div>)}</dl>;
}
