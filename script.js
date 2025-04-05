const supabaseUrl = "https://your-project.supabase.co"; // <- Replace
const supabaseKey = "your-anon-key"; // <- Replace
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

document.getElementById('expense-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const amount = parseFloat(document.getElementById('amount').value);
  const category = document.getElementById('category').value;
  const description = document.getElementById('description').value;
  const date = document.getElementById('date').value;

  const { error } = await supabase.from('expenses').insert([
    { amount, category, description, date }
  ]);

  if (error) {
    alert('Error saving expense');
    console.error(error);
  } else {
    loadExpenses();
    e.target.reset();
  }
});

async function loadExpenses() {
  const { data, error } = await supabase.from('expenses').select('*').order('date', { ascending: false });

  const list = document.getElementById('expense-list');
  const totalEl = document.getElementById('total');
  list.innerHTML = '';
  let total = 0;

  if (error) {
    console.error(error);
    return;
  }

  data.forEach(expense => {
    total += expense.amount;
    const li = document.createElement('li');
    li.textContent = `${expense.date} - ${expense.category}: $${expense.amount}`;
    list.appendChild(li);
  });

  totalEl.textContent = `Total: $${total.toFixed(2)}`;
}

loadExpenses();
