// Unit conversion constants
const FEET_TO_METERS = 0.3048;
const INCH_TO_METERS = 0.0254;
const CUBIC_FEET_TO_CUBIC_METERS = 0.028316846592;
const SQUARE_FEET_TO_SQUARE_METERS = 0.092903;

// Helper function to convert ft-in to meters
function imperialToMeters(feet, inches) {
    return (feet || 0) * FEET_TO_METERS + (inches || 0) * INCH_TO_METERS;
}

// Helper function to convert meters to ft-in
function metersToImperial(meters) {
    const totalFeet = meters / FEET_TO_METERS;
    const feet = Math.floor(totalFeet);
    const inches = Math.round((totalFeet - feet) * 12 * 8) / 8; // Round to nearest 1/8 inch
    if (inches === 12) {
        return { feet: feet + 1, inches: 0 };
    }
    return { feet, inches };
}

// Helper function to convert meters to decimal feet
function metersToDecimalFeet(meters) {
    return meters / FEET_TO_METERS;
}

// Helper function to format ft-in
function formatFtIn(feet, inches) {
    if (inches === 0) {
        return `${feet}'`;
    }
    return `${feet}'-${inches}"`;
}

// Helper function to convert cubic meters to cubic feet
function formatImperialVolume(cubicMeters) {
    const cubicFeet = cubicMeters / CUBIC_FEET_TO_CUBIC_METERS;
    return `${cubicFeet.toFixed(2)} ft³`;
}

// Helper function to format imperial length
function formatImperialLength(meters) {
    const { feet, inches } = metersToImperial(meters);
    return `(${formatFtIn(feet, inches)})`;
}

// Helper function to format square feet to square meters
function formatImperialArea(squareFeet) {
    const squareMeters = squareFeet * SQUARE_FEET_TO_SQUARE_METERS;
    return `(${squareMeters.toFixed(2)} m²)`;
}

// Helper function to get input values based on current unit system
function getInputValue(id) {
    const unitSystem = document.getElementById('unit-system').value;
    if (unitSystem === 'imperial') {
        const feet = parseFloat(document.getElementById(id + '_ft').value) || 0;
        const inches = parseFloat(document.getElementById(id + '_in').value) || 0;
        return imperialToMeters(feet, inches);
    }
    return parseFloat(document.getElementById(id).value) || 0;
}

// Helper function to set results with both metric and imperial units
function setResult(id, value, isVolume = false, isArea = false) {
    const unitSystem = document.getElementById('unit-system').value;
    const isImperial = unitSystem === 'imperial';
    
    if (isVolume) {
        const cubicFeet = value / CUBIC_FEET_TO_CUBIC_METERS;
        document.getElementById(id).textContent = isImperial ? `${cubicFeet.toFixed(2)}` : `${value.toFixed(2)}`;
    } else if (isArea) {
        const squareFeet = value / SQUARE_FEET_TO_SQUARE_METERS;
        document.getElementById(id).textContent = isImperial ? `${squareFeet.toFixed(2)}` : `${value.toFixed(2)}`;
    } else {
        if (isImperial) {
            const decimalFeet = metersToDecimalFeet(value);
            document.getElementById(id).textContent = decimalFeet.toFixed(2);
        } else {
            document.getElementById(id).textContent = `${value.toFixed(2)}`;
        }
    }
}

// Function to change unit system
function changeUnitSystem() {
    const unitSystem = document.getElementById('unit-system').value;
    if (unitSystem === 'imperial') {
        document.body.classList.add('imperial-system');
    } else {
        document.body.classList.remove('imperial-system');
    }
    calculateAll();
}

// Calculate foundation perimeter
function calculatePerimeter() {
    const numLengths = parseInt(document.getElementById('num_lengths').value) || 0;
    const numWidths = parseInt(document.getElementById('num_widths').value) || 0;
    
    let totalLength = 0;
    let lengthCalculations = [];
    for (let i = 1; i <= numLengths; i++) {
        const length = getInputValue(`length_fn_${i}`);
        totalLength += length;
        lengthCalculations.push(formatValue(length));
    }

    let totalWidth = 0;
    let widthCalculations = [];
    for (let i = 1; i <= numWidths; i++) {
        const width = getInputValue(`width_fn_${i}`);
        totalWidth += width;
        widthCalculations.push(formatValue(width));
    }

    const perimeter = totalLength + totalWidth;
    
    // Format calculation steps
    let calculationSteps = '<span class="calculation-step formula">P(fn) = ΣL + ΣW</span>';
    if (lengthCalculations.length > 0 || widthCalculations.length > 0) {
        let calcStep = '= ';
        if (lengthCalculations.length > 0) {
            calcStep += `(${lengthCalculations.join(' + ')})`;
        }
        if (widthCalculations.length > 0) {
            if (lengthCalculations.length > 0) {
                calcStep += ' + ';
            }
            calcStep += `(${widthCalculations.join(' + ')})`;
        }
        calculationSteps += `<span class="calculation-step">${calcStep}</span>`;

        let resultStep = '= ';
        if (lengthCalculations.length > 0) {
            resultStep += formatValue(totalLength);
        }
        if (widthCalculations.length > 0) {
            if (lengthCalculations.length > 0) {
                resultStep += ' + ';
            }
            resultStep += formatValue(totalWidth);
        }
        calculationSteps += `<span class="calculation-step">${resultStep}</span>`;
        calculationSteps += `<span class="calculation-step result">= ${formatValue(perimeter)}</span>`;
    }

    document.getElementById('perimeter_calculation').innerHTML = calculationSteps;

    return perimeter;
}

// Calculate foundation centerline perimeter
function calculateCenterlinePerimeter(perimeter, thickness) {
    const corners = parseInt(document.getElementById('corners_fn').value) || 4;
    return perimeter - corners * thickness;
}

// Calculate foundation concrete volume
function calculateFoundationVolume(clp, thickness, height) {
    return clp * thickness * height;
}

// Calculate strip footing concrete volume
function calculateStripFootingVolume(clp, width, height) {
    return clp * width * height;
}

// Calculate pad footing concrete volume
function calculatePadFootingVolume(width, length, height, number) {
    return width * length * height * number;
}

// Calculate number of anchor bolts
function calculateAnchorBolts(perimeter, boltsPerCorner, boltsPerOpening, numOpenings, numCorners) {
    // Convert perimeter to feet for calculation if in metric
    const perimeterInFeet = document.getElementById('unit-system').value === 'metric' ? 
        metersToDecimalFeet(perimeter) : perimeter;
    
    // Calculate base number of bolts (3 bolts per 16' length)
    const rawBolts = (perimeterInFeet / 16) * 3;
    const baseNumBolts = Math.ceil(rawBolts);
    document.getElementById('base_bolts').textContent = baseNumBolts;
    document.getElementById('base_bolts_calculation').innerHTML = 
        `<span class="calculation-step formula">Base Bolts = Ceiling(P(fn) ÷ 16' × 3)</span>
         <span class="calculation-step">= Ceiling(${perimeterInFeet.toFixed(2)}' ÷ 16' × 3)</span>
         <span class="calculation-step">= Ceiling(${rawBolts.toFixed(2)})</span>
         <span class="calculation-step result">= ${baseNumBolts} bolts</span>`;
    
    // Calculate corner bolts
    const cornerBolts = num_corners * bolts_per_corner;
    document.getElementById('corner_bolts').textContent = cornerBolts;
    document.getElementById('corner_bolts_calculation').innerHTML = 
        `<span class="calculation-step formula">Corner Bolts = Number of Corners × Bolts Per Corner</span>
         <span class="calculation-step">= ${num_corners} × ${bolts_per_corner}</span>
         <span class="calculation-step result">= ${cornerBolts}</span>`;
    
    // Calculate opening bolts
    const openingBolts = num_openings * bolts_per_opening;
    document.getElementById('opening_bolts').textContent = openingBolts;
    document.getElementById('opening_bolts_calculation').innerHTML = 
        `<span class="calculation-step formula">Opening Bolts = Number of Openings × Bolts Per Opening</span>
         <span class="calculation-step">= ${num_openings} × ${bolts_per_opening}</span>
         <span class="calculation-step result">= ${openingBolts}</span>`;
    
    return baseNumBolts + cornerBolts + openingBolts;
}

// Calculate parging area
function calculatePargingArea(perimeter, heightAboveGrade) {
    return perimeter * heightAboveGrade;
}

// Calculate drainage layer area
function calculateDrainageArea(perimeter, heightBelowGrade) {
    return perimeter * heightBelowGrade;
}

// Calculate weeping tile length
function calculateWeepingLength(perimeter, footingProjection, gap, halfTileDiameter) {
    return perimeter + 8 * (footingProjection + gap + halfTileDiameter);
}

// Calculate clear stone height
function calculateStoneHeight(tilePerimeter, clearStone) {
    // Convert 6 inches to meters for comparison
    const MIN_HEIGHT = 6 * INCH_TO_METERS;
    const height = tilePerimeter + clearStone;
    return Math.max(height, MIN_HEIGHT);
}

// Calculate clear stone volume
function calculateStoneVolume(weepingLength, stoneHeight) {
    return weepingLength * stoneHeight * stoneHeight;
}

// Calculate geotextile area
function calculateGeotextileArea(weepingLength, stoneHeight) {
    return weepingLength * (stoneHeight + stoneHeight);
}

// Function to update section inputs
function updateSections() {
    const numSections = parseInt(document.getElementById('num_sections').value) || 0;
    const container = document.getElementById('sections_container');
    container.innerHTML = '';

    for (let i = 1; i <= numSections; i++) {
        const sectionDiv = document.createElement('div');
        sectionDiv.className = 'input-group imperial-input';
        sectionDiv.innerHTML = `
            <label>Section ${i} Length:</label>
            <input type="number" id="section_${i}_length_ft" class="imperial" step="1" placeholder="ft">
            <input type="number" id="section_${i}_length_in" class="imperial" step="0.125" placeholder="in">
            <input type="number" id="section_${i}_length" class="metric" step="0.01">
            <span class="unit-label metric">m</span>
            <span class="unit-label imperial">ft-in</span>
        `;
        container.appendChild(sectionDiv);

        const sectionWidthDiv = document.createElement('div');
        sectionWidthDiv.className = 'input-group imperial-input';
        sectionWidthDiv.innerHTML = `
            <label>Section ${i} Width:</label>
            <input type="number" id="section_${i}_width_ft" class="imperial" step="1" placeholder="ft">
            <input type="number" id="section_${i}_width_in" class="imperial" step="0.125" placeholder="in">
            <input type="number" id="section_${i}_width" class="metric" step="0.01">
            <span class="unit-label metric">m</span>
            <span class="unit-label imperial">ft-in</span>
        `;
        container.appendChild(sectionWidthDiv);
    }

    // Add event listeners to new inputs
    const newInputs = container.querySelectorAll('input');
    newInputs.forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    calculateAll();
}

// Helper function to format values based on unit system
function formatValue(value, isLength = true, isArea = false) {
    const isImperial = document.getElementById('unit-system').value === 'imperial';
    if (isImperial) {
        if (isLength) {
            const { feet, inches } = metersToImperial(value);
            return formatFtIn(feet, inches);
        } else if (isArea) {
            const squareFeet = value / SQUARE_FEET_TO_SQUARE_METERS;
            return `${squareFeet.toFixed(2)} ft²`;
        } else {
            const cubicFeet = value / CUBIC_FEET_TO_CUBIC_METERS;
            return `${cubicFeet.toFixed(2)} ft³`;
        }
    }
    if (isArea) {
        return value.toFixed(2) + " m²";
    }
    return value.toFixed(2) + (isLength ? " m" : " m³");
}

// Calculate house area
function calculateHouseArea(numSections) {
    let totalArea = 0;
    let calculations = [];

    for (let i = 1; i <= numSections; i++) {
        const length = getInputValue(`section_${i}_length`);
        const width = getInputValue(`section_${i}_width`);
        const sectionArea = length * width;
        totalArea += sectionArea;
        
        const isImperial = document.getElementById('unit-system').value === 'imperial';
        const lengthStr = formatValue(length, true);
        const widthStr = formatValue(width, true);
        const areaStr = formatValue(sectionArea, false, true);
        
        calculations.push(`Section ${i}: ${lengthStr} × ${widthStr} = ${areaStr}`);
    }

    return { area: totalArea, calculations };
}

// Calculate top of wall area
function calculateTopWallArea(centerlinePerimeter, thickness) {
    return centerlinePerimeter * thickness;
}

// Calculate slab area
function calculateSlabArea(houseArea, topWallArea) {
    return houseArea - topWallArea;
}

// Calculate slab volume
function calculateSlabVolume(slabArea, thickness) {
    return slabArea * thickness;
}

// Calculate under slab volume
function calculateUnderSlabVolume(slabArea, thickness) {
    return slabArea * thickness;
}

// Calculate under slab poly area
function calculateUnderSlabPolyArea(slabArea) {
    return slabArea * 1.06; // Adding 6% lap factor
}

// Calculate slab WWM area
function calculateSlabWWMArea(slabArea) {
    return slabArea * 1.06; // Adding 6% lap factor
}

// Main calculation function
function calculateAll() {
    const unitSystem = document.getElementById('unit-system').value;
    const isImperial = unitSystem === 'imperial';

    // Get all input values
    const thickness_fn = getInputValue('thickness_fn');
    const height_fn = getInputValue('height_fn');
    const width_sf = getInputValue('width_sf');
    const height_sf = getInputValue('height_sf');
    const width_pf = getInputValue('width_pf');
    const length_pf = getInputValue('length_pf');
    const height_pf = getInputValue('height_pf');
    const num_pf = parseInt(document.getElementById('num_pf').value) || 0;
    const num_corners = parseInt(document.getElementById('corners_fn').value) || 4;
    const bolts_per_corner = parseInt(document.getElementById('bolts_per_corner').value) || 0;
    const bolts_per_opening = parseInt(document.getElementById('bolts_per_opening').value) || 0;
    const num_openings = parseInt(document.getElementById('num_openings').value) || 0;
    const height_above_grade = getInputValue('height_above_grade');
    const height_below_grade = getInputValue('height_below_grade');

    // Get additional input values for new calculations
    const footing_projection = getInputValue('footing_projection');
    const gap = getInputValue('gap');
    const half_tile_diameter = getInputValue('half_tile_diameter');
    const clear_stone = getInputValue('clear_stone');

    // Get additional input values for slab calculations
    const numSections = parseInt(document.getElementById('num_sections').value) || 0;
    const slab_thickness = getInputValue('slab_thickness');
    const footing_thickness = getInputValue('footing_thickness');

    // Calculate foundation perimeter
    const perimeter = calculatePerimeter();
    setResult('perimeter_fn', perimeter);

    // Calculate foundation centerline perimeter
    let centerlinePerimeter = calculateCenterlinePerimeter(perimeter, thickness_fn);
    
    // Check for manual CLP input
    const manualCLP = getInputValue('manual_clp');
    if (manualCLP > 0) {
        centerlinePerimeter = manualCLP;
        document.getElementById('centerline_calculation').innerHTML = 
            `<span class="calculation-step formula">Using manually input CLP(fn)</span>
             <span class="calculation-step result">= ${formatValue(centerlinePerimeter)}</span>`;
    } else {
        document.getElementById('centerline_calculation').innerHTML = 
            `<span class="calculation-step formula">CLP(fn) = P(fn) - Corners × T(fn)</span>
             <span class="calculation-step">= ${formatValue(perimeter)} - ${num_corners} × ${formatValue(thickness_fn)}</span>
             <span class="calculation-step result">= ${formatValue(centerlinePerimeter)}</span>`;
    }
    setResult('centerline_perimeter', centerlinePerimeter);

    // Calculate foundation concrete volume
    const foundationVolume = calculateFoundationVolume(centerlinePerimeter, thickness_fn, height_fn);
    setResult('volume_fn', foundationVolume, true);
    document.getElementById('foundation_volume_calculation').innerHTML = 
        `<span class="calculation-step formula">V(fn) = CLP(fn) × T(fn) × H(fn)</span>
         <span class="calculation-step">= ${formatValue(centerlinePerimeter)} × ${formatValue(thickness_fn)} × ${formatValue(height_fn)}</span>
         <span class="calculation-step result">= ${formatValue(foundationVolume, false)}</span>`;

    // Calculate strip footing concrete volume
    const stripFootingVolume = calculateStripFootingVolume(centerlinePerimeter, width_sf, height_sf);
    setResult('volume_sf', stripFootingVolume, true);
    document.getElementById('strip_footing_calculation').innerHTML = 
        `<span class="calculation-step formula">V(sf) = CLP(fn) × W(sf) × H(sf)</span>
         <span class="calculation-step">= ${formatValue(centerlinePerimeter)} × ${formatValue(width_sf)} × ${formatValue(height_sf)}</span>
         <span class="calculation-step result">= ${formatValue(stripFootingVolume, false)}</span>`;

    // Calculate pad footing concrete volume
    const padFootingVolume = calculatePadFootingVolume(width_pf, length_pf, height_pf, num_pf);
    setResult('volume_pf', padFootingVolume, true);
    document.getElementById('pad_footing_calculation').innerHTML = 
        `<span class="calculation-step formula">V(pf) = W(pf) × L(pf) × H(pf) × #</span>
         <span class="calculation-step">= ${formatValue(width_pf)} × ${formatValue(length_pf)} × ${formatValue(height_pf)} × ${num_pf}</span>
         <span class="calculation-step result">= ${formatValue(padFootingVolume, false)}</span>`;

    // Calculate total footing concrete volume
    const totalVolume = stripFootingVolume + padFootingVolume;
    setResult('volume_total', totalVolume, true);
    document.getElementById('total_volume_calculation').innerHTML = 
        `<span class="calculation-step formula">V(fts) = V(sf) + V(pf)</span>
         <span class="calculation-step">= ${formatValue(stripFootingVolume, false)} + ${formatValue(padFootingVolume, false)}</span>
         <span class="calculation-step result">= ${formatValue(totalVolume, false)}</span>`;

    // Calculate anchor bolts
    const perimeterInFeet = isImperial ? metersToDecimalFeet(perimeter) : metersToDecimalFeet(perimeter);
    
    const baseNumBolts = Math.ceil(perimeterInFeet / 16) * 3;
    document.getElementById('base_bolts').textContent = baseNumBolts;
    document.getElementById('base_bolts_calculation').innerHTML = 
        `<span class="calculation-step formula">Base Bolts = P(fn) ÷ 16' × 3</span>
         <span class="calculation-step">= ${perimeterInFeet.toFixed(2)}' ÷ 16' × 3</span>
         <span class="calculation-step">= ${(perimeterInFeet / 16 * 3).toFixed(2)}</span>
         <span class="calculation-step result">= ${baseNumBolts} bolts</span>`;
    
    const cornerBolts = num_corners * bolts_per_corner;
    document.getElementById('corner_bolts').textContent = cornerBolts;
    document.getElementById('corner_bolts_calculation').innerHTML = 
        `<span class="calculation-step formula">Corner Bolts = Number of Corners × Bolts Per Corner</span>
         <span class="calculation-step">= ${num_corners} × ${bolts_per_corner}</span>
         <span class="calculation-step result">= ${cornerBolts}</span>`;
    
    const openingBolts = num_openings * bolts_per_opening;
    document.getElementById('opening_bolts').textContent = openingBolts;
    document.getElementById('opening_bolts_calculation').innerHTML = 
        `<span class="calculation-step formula">Opening Bolts = Number of Openings × Bolts Per Opening</span>
         <span class="calculation-step">= ${num_openings} × ${bolts_per_opening}</span>
         <span class="calculation-step result">= ${openingBolts}</span>`;
    
    const totalBolts = baseNumBolts + cornerBolts + openingBolts;
    document.getElementById('total_bolts').textContent = totalBolts;
    document.getElementById('total_bolts_calculation').innerHTML = 
        `<span class="calculation-step formula">Total Bolts = Base Bolts + Corner Bolts + Opening Bolts</span>
         <span class="calculation-step">= ${baseNumBolts} + ${cornerBolts} + ${openingBolts}</span>
         <span class="calculation-step result">= ${totalBolts}</span>`;

    // Calculate parging area
    const pargingArea = calculatePargingArea(perimeter, height_above_grade);
    setResult('parging_area', pargingArea, false, true);
    document.getElementById('parging_calculation').innerHTML = 
        `<span class="calculation-step formula">A(pg) = P(fn) × H(above grade)</span>
         <span class="calculation-step">= ${formatValue(perimeter)} × ${formatValue(height_above_grade)}</span>
         <span class="calculation-step result">= ${isImperial ? (pargingArea / SQUARE_FEET_TO_SQUARE_METERS).toFixed(2) + " ft²" : pargingArea.toFixed(2) + " m²"}</span>`;

    // Calculate drainage layer area
    const drainageArea = calculateDrainageArea(perimeter, height_below_grade);
    setResult('drainage_area', drainageArea, false, true);
    document.getElementById('drainage_calculation').innerHTML = 
        `<span class="calculation-step formula">A(dl) = P(fn) × H(below grade)</span>
         <span class="calculation-step">= ${formatValue(perimeter)} × ${formatValue(height_below_grade)}</span>
         <span class="calculation-step result">= ${isImperial ? (drainageArea / SQUARE_FEET_TO_SQUARE_METERS).toFixed(2) + " ft²" : drainageArea.toFixed(2) + " m²"}</span>`;

    // Calculate weeping tile length
    const weepingLength = perimeter === 0 ? 0 : calculateWeepingLength(perimeter, footing_projection, gap, half_tile_diameter);
    setResult('weeping_length', weepingLength);
    document.getElementById('weeping_length_calculation').innerHTML = 
        perimeter === 0 ? 
        `<span class="calculation-step formula">Please input Foundation Parameters to calculate P(fn) first</span>` :
        `<span class="calculation-step formula">CLP(weep) = P(fn) + 8 × [Footing Projection + Gap + 1/2 Tile Diameter]</span>
         <span class="calculation-step">= ${formatValue(perimeter)} + 8 × [${formatValue(footing_projection)} + ${formatValue(gap)} + ${formatValue(half_tile_diameter)}]</span>
         <span class="calculation-step result">= ${formatValue(weepingLength)}</span>`;

    // Calculate clear stone height
    const tileDiameter = half_tile_diameter * 2;
    const stoneHeight = perimeter === 0 ? 0 : calculateStoneHeight(tileDiameter, clear_stone);
    setResult('stone_height', stoneHeight);
    document.getElementById('stone_height_calculation').innerHTML = 
        perimeter === 0 ?
        `<span class="calculation-step formula">Please input Foundation Parameters to calculate P(fn) first</span>` :
        `<span class="calculation-step formula">H(sc) = 2 × (1/2 Tile Diameter) + 3/4 Clear Stone (min. 6")</span>
         <span class="calculation-step">= 2 × ${formatValue(half_tile_diameter)} + ${formatValue(clear_stone)}</span>
         <span class="calculation-step result">= ${formatValue(stoneHeight)}</span>`;

    // Calculate clear stone volume
    const stoneVolume = perimeter === 0 ? 0 : calculateStoneVolume(weepingLength, stoneHeight);
    setResult('stone_volume', stoneVolume, true);
    document.getElementById('stone_volume_calculation').innerHTML = 
        perimeter === 0 ?
        `<span class="calculation-step formula">Please input Foundation Parameters to calculate P(fn) first</span>` :
        `<span class="calculation-step formula">V(stc) = CLP(weep) × H(sc) × H(sc)</span>
         <span class="calculation-step">= ${formatValue(weepingLength)} × ${formatValue(stoneHeight)} × ${formatValue(stoneHeight)}</span>
         <span class="calculation-step result">= ${formatValue(stoneVolume, false)}</span>`;

    // Calculate geotextile area
    const geotextileArea = perimeter === 0 ? 0 : calculateGeotextileArea(weepingLength, stoneHeight);
    setResult('geotextile_area', geotextileArea, false, true);
    document.getElementById('geotextile_calculation').innerHTML = 
        perimeter === 0 ?
        `<span class="calculation-step formula">Please input Foundation Parameters to calculate P(fn) first</span>` :
        `<span class="calculation-step formula">A(geo) = CLP(weep) × [H(sc) + H(sc)]</span>
         <span class="calculation-step">= ${formatValue(weepingLength)} × [${formatValue(stoneHeight)} + ${formatValue(stoneHeight)}]</span>
         <span class="calculation-step result">= ${isImperial ? (geotextileArea / SQUARE_FEET_TO_SQUARE_METERS).toFixed(2) + " ft²" : geotextileArea.toFixed(2) + " m²"}</span>`;

    // Calculate house area
    const { area: houseArea, calculations: houseCalculations } = calculateHouseArea(numSections);
    setResult('house_area', houseArea, false, true);
    document.getElementById('house_area_calculation').innerHTML = 
        `<span class="calculation-step formula">A(house) = Σ A(sections)</span>
         ${houseCalculations.map(calc => `<span class="calculation-step">${calc}</span>`).join('')}
         <span class="calculation-step result">= ${formatValue(houseArea, false, true)}</span>`;

    // Calculate top of wall area
    const topWallArea = calculateTopWallArea(centerlinePerimeter, thickness_fn);
    setResult('top_wall_area', topWallArea, false, true);
    document.getElementById('top_wall_area_calculation').innerHTML = 
        `<span class="calculation-step formula">A(top of wall) = CLP(fn) × T(fn)</span>
         <span class="calculation-step">= ${formatValue(centerlinePerimeter)} × ${formatValue(thickness_fn)}</span>
         <span class="calculation-step result">= ${formatValue(topWallArea, false, true)}</span>`;

    // Calculate slab area
    const slabArea = calculateSlabArea(houseArea, topWallArea);
    setResult('slab_area', slabArea, false, true);
    document.getElementById('slab_area_calculation').innerHTML = 
        `<span class="calculation-step formula">A(slab) = A(house) - A(top of wall)</span>
         <span class="calculation-step">= ${formatValue(houseArea, false, true)} - ${formatValue(topWallArea, false, true)}</span>
         <span class="calculation-step result">= ${formatValue(slabArea, false, true)}</span>`;

    // Calculate slab volume
    const slabVolume = calculateSlabVolume(slabArea, slab_thickness);
    setResult('slab_volume', slabVolume, true);
    document.getElementById('slab_volume_calculation').innerHTML = 
        `<span class="calculation-step formula">V(slab) = A(slab) × Slab Thickness</span>
         <span class="calculation-step">= ${formatValue(slabArea, false, true)} × ${formatValue(slab_thickness)}</span>
         <span class="calculation-step result">= ${formatValue(slabVolume, false)}</span>`;

    // Calculate area under slab
    setResult('area_under_slab', slabArea, false, true);

    // Calculate volume under slab
    const volumeUnderSlab = calculateUnderSlabVolume(slabArea, footing_thickness);
    setResult('volume_under_slab', volumeUnderSlab, true);
    document.getElementById('volume_under_slab_calculation').innerHTML = 
        `<span class="calculation-step formula">V(uss) = A(slab) × Footing Thickness</span>
         <span class="calculation-step">= ${formatValue(slabArea, false, true)} × ${formatValue(footing_thickness)}</span>
         <span class="calculation-step result">= ${formatValue(volumeUnderSlab, false)}</span>`;

    // Calculate area of under slab poly
    const underSlabPolyArea = calculateUnderSlabPolyArea(slabArea);
    setResult('area_under_slab_poly', underSlabPolyArea, false, true);
    document.getElementById('area_under_slab_poly_calculation').innerHTML = 
        `<span class="calculation-step formula">A(sp) = A(slab) + 6% Lap Factor</span>
         <span class="calculation-step">= ${formatValue(slabArea, false, true)} × 1.06</span>
         <span class="calculation-step result">= ${formatValue(underSlabPolyArea, false, true)}</span>`;

    // Calculate slab WWM area
    const slabWWMArea = calculateSlabWWMArea(slabArea);
    setResult('slab_wwm', slabWWMArea, false, true);
    document.getElementById('slab_wwm_calculation').innerHTML = 
        `<span class="calculation-step formula">A(wwm) = A(slab) + 6% Lap Factor</span>
         <span class="calculation-step">= ${formatValue(slabArea, false, true)} × 1.06</span>
         <span class="calculation-step result">= ${formatValue(slabWWMArea, false, true)}</span>`;
}

// Add event listeners to all input fields for real-time calculation
const inputs = document.querySelectorAll('input');
inputs.forEach(input => {
    input.addEventListener('input', calculateAll);
});

// Add event listener for section updates
document.getElementById('num_sections').addEventListener('change', updateSections);

// Function to update foundation inputs
function updateFoundationInputs() {
    const numLengths = parseInt(document.getElementById('num_lengths').value) || 0;
    const numWidths = parseInt(document.getElementById('num_widths').value) || 0;
    
    // Update lengths container
    const lengthsContainer = document.getElementById('foundation_lengths_container');
    lengthsContainer.innerHTML = '';
    for (let i = 1; i <= numLengths; i++) {
        const lengthDiv = document.createElement('div');
        lengthDiv.className = 'input-group imperial-input';
        lengthDiv.innerHTML = `
            <label>Length ${i}:</label>
            <input type="number" id="length_fn_${i}_ft" class="imperial" step="1" placeholder="ft">
            <input type="number" id="length_fn_${i}_in" class="imperial" step="0.125" placeholder="in">
            <input type="number" id="length_fn_${i}" class="metric" step="0.01">
            <span class="unit-label metric">m</span>
            <span class="unit-label imperial">ft-in</span>
        `;
        lengthsContainer.appendChild(lengthDiv);
    }

    // Update widths container
    const widthsContainer = document.getElementById('foundation_widths_container');
    widthsContainer.innerHTML = '';
    for (let i = 1; i <= numWidths; i++) {
        const widthDiv = document.createElement('div');
        widthDiv.className = 'input-group imperial-input';
        widthDiv.innerHTML = `
            <label>Width ${i}:</label>
            <input type="number" id="width_fn_${i}_ft" class="imperial" step="1" placeholder="ft">
            <input type="number" id="width_fn_${i}_in" class="imperial" step="0.125" placeholder="in">
            <input type="number" id="width_fn_${i}" class="metric" step="0.01">
            <span class="unit-label metric">m</span>
            <span class="unit-label imperial">ft-in</span>
        `;
        widthsContainer.appendChild(widthDiv);
    }

    // Add event listeners to new inputs
    const newInputs = document.querySelectorAll('#foundation_lengths_container input, #foundation_widths_container input');
    newInputs.forEach(input => {
        input.addEventListener('input', calculateAll);
    });

    calculateAll();
}

// Initialize the calculator
document.addEventListener('DOMContentLoaded', () => {
    // Add event listeners for foundation segment selects
    document.getElementById('num_lengths').addEventListener('change', updateFoundationInputs);
    document.getElementById('num_widths').addEventListener('change', updateFoundationInputs);
    
    // Initialize unit system
    changeUnitSystem();
    
    // Add event listener for corners input
    document.getElementById('corners_fn').addEventListener('input', calculateAll);

    // Add event listeners for manual CLP inputs
    const manualCLPInputs = ['manual_clp', 'manual_clp_ft', 'manual_clp_in'];
    manualCLPInputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', calculateAll);
        }
    });
}); 