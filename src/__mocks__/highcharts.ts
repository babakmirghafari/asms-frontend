// Jest mock for Highcharts — prevents canvas/SVG errors in jsdom
const Highcharts: Record<string, unknown> = {
  chart: jest.fn(),
  setOptions: jest.fn(),
  getOptions: jest.fn(() => ({})),
  addEvent: jest.fn(),
};

export default Highcharts;
module.exports = Highcharts;
