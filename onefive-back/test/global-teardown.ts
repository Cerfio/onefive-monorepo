async function globalTeardown() {
  console.log('✅ All tests completed');
  // Note: Le cleanup est géré par --forceExit de Jest
  // qui ferme proprement toutes les connexions
}

// Jest globalTeardown requires module.exports = function (SWC compat)
module.exports = globalTeardown;
