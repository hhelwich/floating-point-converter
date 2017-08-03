// Endianess of this system (untested…)
const littleEndian = new Uint16Array(new Uint8Array([0, 1]).buffer)[0] !== 1;

// --------------------------------------------------- Mutable state ---------------------------------------------------

// Use 64 or 32 bit floating point in conversion
let f64 = true;
// Current float
let float = Math.PI;

// ------------------------------------------------------- Logic -------------------------------------------------------

const toBytes = float => {
  const bytes = Array.from(new Uint8Array(new (f64 ? Float64Array : Float32Array)([float]).buffer));
  return littleEndian ? bytes.reverse() : bytes;
};

const fromBytes = bytes => {
  if (littleEndian) {
    bytes = bytes.slice().reverse();
  }
  return new (f64 ? Float64Array : Float32Array)(new Uint8Array(bytes).buffer)[0];
};

const fromBitsStr = bitsStr => bitsStr.match(/.{1,8}/g).map(byteStr => parseInt(byteStr, 2));

const toByteStr = byte => {
  const s = `0000000${byte.toString(2)}`;
  return s.substr(s.length - 8);
};

const toBitsStr = bytes => bytes.map(toByteStr).join('');

//

const $bits = $('#bits input');
const $float = $('#float');
const $window = $(window);
const $document = $(document);
const $numberList = $('#numberList');

const nbrWidth = (() => {
  const e = $('<span>').hide().appendTo(document.body);
  const width = e.text(toBitsStr([0,0,0,0,0,0,0,0])).addClass('number').width();
  e.remove();
  return width / 64;
})();

const showFloat = () => {
  let floatStr = String(float);
  if (float === 0 && 1 / float === -Infinity) {
    floatStr = '-0';
  }
  $float.val(floatStr);
}
const showBits = () => {
  $bits.val(toBitsStr(toBytes(float)));
}

$float.width(nbrWidth * 32 + 5);

const showBitsInfo = () => {
  //TODO fix width and height calculations
  const width = nbrWidth * (f64 ? 64 : 32);
  $bits.width(width + 5);
  const height = $bits.outerHeight() - 2;
  const d = ($bits.outerWidth() - width) / 2;
  $('.sign').width(nbrWidth * 1 + d * (1/3)).height(height);
  $('.exponent').width(nbrWidth * (f64 ? 11 : 8)).height(height);
  $('.mantissa').width(nbrWidth * (f64 ? 52 : 23) + d * (2/3)).height(height);
};

const changeBits = bitsStr => {
  float = fromBytes(fromBitsStr(bitsStr));
  showFloat();
};

// Init dom state

$('#byte-order').text(littleEndian ? 'little endian' : 'big endian');
$(`#f${f64 ? '64' : '32'}`).prop('checked', true);
showFloat();
showBits();
showBitsInfo();

// Add event listeners

$('input[type=radio][name=fBits]').change(function() {
  f64 = this.value === 'f64';
  showBits();
  showBitsInfo();
});

$float.keyup(function(e) {
  float = Number(this.value);
  if (isNaN(float)) {
    try {
      float = parseFloat(new Function('return (' + this.value + ');')(), 10);
    } catch (_) {
      float = NaN;
    }
  }
  showBits();
  if (e.key === 'Enter') {
    showFloat();
  }
});

const assureBitsLength = value => {
  const length = f64 ? 64 : 32;
  if (value.length > length) {
    value = value.substr(0, length);
  } else while (value.length < length) {
    value += '0';
  }
  return value;
}

$bits.keydown(function(e) {
  if (e.key === '0' || e.key === '1') {
    const s0 = this.selectionStart;
    let s1 = this.selectionEnd;
    if (s1 === s0) {
      s1++;
    }
    let value = this.value;
    value = value.substr(0, s0) + e.key + value.substr(s1);
    value = assureBitsLength(value);
    this.value = value;
    this.selectionStart = s0 + 1;
    this.selectionEnd = s0 + 1;
    changeBits(value);
    e.preventDefault();
  } else if (e.key === 'Enter') {
    changeBits(this.value);
  }
}).keyup(function() {
  let value = this.value;
  value = value.replace(/[^01]/g, '0');
  value = assureBitsLength(value);
  if (value !== this.value) {
    const s0 = this.selectionStart;
    const s1 = this.selectionEnd;
    this.value = value;
    this.selectionStart = s0;
    this.selectionEnd = s1;
    changeBits(value);
  }
});

const scrollAddNbrCount = 20;

(() => {
  let docHeight = $document.height();
  const winHeight = $window.height();
  $numberList.append('<div class="card text-center card-primary"><div class="card-block" >' + float + '</div></div>');
  while (docHeight < winHeight * 10) {
    $numberList.prepend('<div class="card text-center"><div class="card-block" >' + Math.random() + '</div></div>');
    $numberList.append('<div class="card text-center"><div class="card-block" >' + Math.random() + '</div></div>');
    docHeight = $document.height();
  }
  $window.scrollTop(($document.height() - winHeight) / 2);

})();

$window.scroll(() => {
  const scrollTop = $window.scrollTop();
  const docHeight = $document.height();
  const winHeight = $window.height();
  if (scrollTop === docHeight - winHeight) {
    // scrolled to bottom of page
    let nnbrs = '';
    for (let i = 0; i < scrollAddNbrCount; i++) {
      nnbrs += '<div class="card text-center"><div class="card-block">'+Math.random()+'</div></div>';
    }
    $numberList.children().slice(0, scrollAddNbrCount).remove()
    $numberList.append(nnbrs);
  }
  if (scrollTop <= 20) {
    // scrolled to top of page
    let nnbrs = '';
    for (let i = 0; i < scrollAddNbrCount; i++) {
      nnbrs += '<div class="card text-center"><div class="card-block">'+Math.random()+'</div></div>';
    }
    $numberList.children().slice(-scrollAddNbrCount).remove()
    $numberList.prepend(nnbrs);
  }
});
