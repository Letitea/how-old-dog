    // 使用常用年長度，包含閏年的平均值
    const MS_PER_DAY = 1000 * 60 * 60 * 24;
    const AVG_DAYS_PER_YEAR = 365.2425;

    const birthEl = document.getElementById('birth');
    const calcBtn = document.getElementById('calc');
    const clearBtn = document.getElementById('clear');
    const resultEl = document.getElementById('result');
    const noteEl = document.getElementById('note');

    function formatNumber(n, digits=1){
      return Number.isFinite(n) ? n.toFixed(digits) : '—';
    }

    function computeDogAgeParts(birthDate, nowDate){
      // years, months, days (rough calendar diff)
      const by = birthDate.getFullYear();
      const bm = birthDate.getMonth();
      const bd = birthDate.getDate();

      const ny = nowDate.getFullYear();
      const nm = nowDate.getMonth();
      const nd = nowDate.getDate();

      let years = ny - by;
      let months = nm - bm;
      let days = nd - bd;
      if (days < 0){
        months -= 1;
        // borrow days from previous month
        const prevMonth = new Date(nowDate.getFullYear(), nowDate.getMonth(), 0);
        days += prevMonth.getDate();
      }
      if (months < 0){
        years -= 1;
        months += 12;
      }
      return {years, months, days};
    }

    function humanAgeFromDogYears(dogYears){
      // formula: human_age = 16 * ln(dog_age) + 31
      // natural log
      if (dogYears <= 0) return NaN;
      return 16 * Math.log(dogYears) + 31;
    }

    function calculate(){
      resultEl.innerHTML = '';
      noteEl.style.display = 'none';

      const birthVal = birthEl.value;
      if (!birthVal){
        resultEl.innerHTML = '<div class="muted">請先選擇出生日期。</div>';
        return;
      }

      const birthDate = new Date(birthVal + 'T00:00:00');
      const now = new Date();
      if (birthDate > now){
        resultEl.innerHTML = '<div class="muted">出生日期不能晚於今天。</div>';
        return;
      }

      // precise age in days and years (decimal)
      const diffMs = now - birthDate;
      const diffDays = diffMs / MS_PER_DAY;
      const dogYearsDecimal = diffDays / AVG_DAYS_PER_YEAR;

      // calendar style parts
      const parts = computeDogAgeParts(birthDate, now);

      // human age using formula
      const humanAge = humanAgeFromDogYears(dogYearsDecimal);

      // build result display
      const html = [];
      html.push('<div class="row">');
      html.push('<div class="tile"><strong>狗狗實際年齡</strong><div class="muted" style="margin-top:8px">' + parts.years + ' 歲 ' + parts.months + ' 個月 ' + parts.days + ' 天</div><div class="muted" style="margin-top:6px">(十進制年) ' + formatNumber(dogYearsDecimal,3) + ' 年)</div></div>');
      html.push('<div class="tile"><strong>換算成人類年齡</strong><div class="muted" style="margin-top:8px">根據公式 human_age = 16 × ln(dog_age) + 31</div><div style="margin-top:10px;font-size:1.4rem;font-weight:700">' + (Number.isFinite(humanAge) ? formatNumber(humanAge,1) + ' 歲' : '無法計算') + '</div></div>');
      html.push('</div>');

      // provide raw values and formula details
      html.push('<div class="muted" style="margin-top:12px">公式套用的 dog_age（年，十進制）： ' + formatNumber(dogYearsDecimal,6) + '</div>');

      resultEl.innerHTML = html.join('\n');

      // show note/warning for small ages
      if (dogYearsDecimal < 0.5){
        noteEl.style.display = 'block';
        noteEl.innerHTML = '注意：狗狗年齡小於 6 個月時，將此十進制年值代入該研究公式會得到外推結果，可能與實際成長速度不符。若要使用傳統對照表，請參考獸醫建議或常見犬齡對照表。';
      } else if (dogYearsDecimal < 1){
        noteEl.style.display = 'block';
        noteEl.innerHTML = '注意：該公式在 1 歲附近的外推仍可能不穩定；研究通常以成年犬資料為主。1 歲以下的換算應謹慎參考。';
      }
    }

    // 讓按鈕具備 click 行為（原本已用 addEventListener）
// LocalStorage restore
document.addEventListener('DOMContentLoaded',()=>{
      const saved = localStorage.getItem('dogAge');
      if(saved){
        birthEl.value = saved;
        // 自動呼叫計算
        calculate();
      }
    });

// Save selected date
calcBtn.addEventListener('click', ()=>{
      if(birthEl.value){ localStorage.setItem('dogAge', birthEl.value); }
      calculate();
    });

// calcBtn.addEventListener('click', calculate);
// 也加入 inline onclick 以確保某些舊瀏覽器或嵌入情境能正常觸發
calcBtn.setAttribute('onclick', 'calculate()');
    birthEl.addEventListener('change', () => { /* auto-calc optional */ });

    clearBtn.addEventListener('click', ()=>{
      birthEl.value = '';
      resultEl.innerHTML = '';
      noteEl.style.display = 'none';
    });

    // optional: if user presses Enter on date input
    birthEl.addEventListener('keydown', (e)=>{ if(e.key === 'Enter') calculate(); });

    // prefill with a sample date for demonstration (comment out if undesired)
    // birthEl.value = '2022-06-01';
