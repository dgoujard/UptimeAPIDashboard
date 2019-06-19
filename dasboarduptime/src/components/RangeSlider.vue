<template>
      <div class="range-slider">
        <span class="range-slider__value" id="value1">22h30</span>
        <input class="range-slider__range value1" type="range" value="0" min="0" max="86400" step="900">
      </div>
</template>

<script>
export default {
    name: 'RangeSlider'
}

</script>

<style>
*, *:before, *:after {
  box-sizing: border-box;
}
body {
  font-family: sans-serif;
  padding: 60px 20px;
}
@media (min-width: 600px) {
  body {
    padding: 60px;
  }
}
.range-slider {
  margin: 60px 0 0 0%;
  width: 100%;
  text-align: center
}

.range-slider__range {
  width: 90%;
  height: 5px;
  border-radius: 5px;
  background: #f2f2f2;
  outline: none;
  padding: 0;
  text-align: center
}
.range-slider__range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #12192a;
  cursor: pointer;
  transition: background 0.15s ease-in-out;
}
.range-slider__range::-webkit-slider-thumb:hover {
  background: #1abc9c;
}
.range-slider__range:active::-webkit-slider-thumb {
  background: #1abc9c;
}
.range-slider__range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 50%;
  background: #12192a;
  cursor: pointer;
  transition: background 0.15s ease-in-out;
}
.range-slider__range::-moz-range-thumb:hover {
  background: #1abc9c;
}
.range-slider__range:active::-moz-range-thumb {
  background: #1abc9c;
}
.range-slider__range:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px #fff, 0 0 0 6px #1abc9c;
}

.range-slider__value {
  display: block;
  position: relative;
  width: 40px;
  color: #fff;
  line-height: 20px;
  text-align: center;
  border-radius: 3px;
  background: #12192a;
  margin-bottom : 10px;
}

::-moz-range-track {
  background: #d7dcdf;
  border: 0;
}
input::-moz-focus-inner, input::-moz-focus-outer {
  border: 0;
}
</style>