// Disable native browser validation
// The "js-validate" class provides a switch to enable this behavior
// on specific forms
var $forms = document.querySelectorAll(".js-validate");

Array.from($forms).forEach(function($form) {
    $form.setAttribute("novalidate", true);
});


// Check validity when the user leaves the field
// "blur" event doesn't bubble all the way like "click" events
// set useCapture parameter to "true" to enable trickle down
document.addEventListener("blur", handleBlur, true);

// Check all fields on submit
document.addEventListener("submit", handleSubmit, false);

function handleBlur(event) {
    // Only run if the blurred field is in a form to be validated
    if (!event.target.form.classList.contains("js-validate")) return;

    // Validate the field
    let error = hasError(event.target);

    // If there's an error, show it
    if(error) {
        showError(event.target, error);
        return;
    }

    // Otherwise, remove any existing error message
    removeError(event.target);
}

function handleSubmit(event) {
    // Only run on forms flagged for validation
    if (!event.target.classList.contains("js-validate")) return;
    
    // Get all of the form elements
    var fields = event.target.elements;

    // Validate each field
    // Store the first field with an error to a variable so we can bring it into focus later
    var error, hasErrors;
    for (var i = 0; i < fields.length; i++) {
        error = hasError(fields[i]);
        if (error) {
            showError(fields[i], error);
            if (!hasErrors) {
                hasErrors = fields[i];
            }
        }
    }

    // If there are errrors, don't submit form and focus on first element with error
    if (hasErrors) {
        event.preventDefault();
        hasErrors.focus();
    }

    // Otherwise, let the form submit normally
    // Can bolt in an ajax form submit process here
}
// Handles checking the validity object
// If there's no error, returns null
// Otherwise returns a string with the proper error message
function hasError(field) {
    // Don't validate submits, buttons, file and reset inputs, and disabled fields
    if (
        field.disabled || 
        field.type == "file" || 
        field.type == "reset" ||
        field.type == "submit" ||
        field.type == "buton"
    ) {
        return;
    }

    // Get validity
    let validity = field.validity;

    // If valid, return null
    if (validity.valid) return;

    // If field is required and empty
    if (validity.valueMissing) return 'Please fill out this field.';

    // If not the right type
    if (validity.typeMismatch) {

        // Email
        if (field.type === 'email') return 'Please enter a valid email address.';

        // URL
        if (field.type === 'url') return 'Please enter a valid URL.';
    }

    // If too short
    if (validity.tooShort) {
        return (`
            Please lengthen this text to ${field.getAttribute('minLength')} characters or more.
            You are currently using ${field.value.length} characters
        `);
    }

    // If too long
    if (validity.tooLong) {
        return (`
            Please shorten this text to no more than ${field.getAttribute('maxLength')} characters. 
            You are currently using ${field.value.length} characters.
        `);
        
    }

    // If number input isn't a number
    if (validity.badInput) return 'Please enter a number.';

    // If a number value doesn't match the step interval
    if (validity.stepMismatch) return 'Please select a valid value.';

    // If a number field is over the max
    if (validity.rangeOverflow) {
        return (`
            Please select a value less than ${field.getAttribute("max")}.
        `);            
    }

    // If a number field is below the min
    if (validity.rangeUnderflow) {
        return (`
            Please select a value greater than ${field.getAttribute("min")}.
        `);
    }

    // If pattern doesn't match
    if (validity.patternMismatch) {
        // If pattern info is included, return custom error
        if (field.hasAttribute("title")) return field.getAttribute("title");

        // Otherwise, return generic error
        return 'Please match the requested format.';
    }

    // If all else fails, return a generic catchall error
    return 'The value you entered for this field is invalid.';
}


function showError(field, error) {
    // Add error class to field
    field.classList.add("error");


    // If the field is a radio buton and part of a group, error all and get the last item in the group
    if (field.type === 'radio' && field.name) {
        var group = document.getElementsByName(field.name);
        if (group.length > 0) {
            for (var i = 0; i < group.length; i++) {
                // Only check fields in current form
                if (group[i].form !== field.form) continue;
                group[i].classList.add('error');
            }
            field = group[group.length - 1];
        }
    }

    // Get field id or name
    let id = field.id || field.name;
    if (!id) return;

    // Check if error message field already exists
    // If not, create one
    let message = field.form.querySelector(`.error-message#error-for-${id}`);
    if (!message) {
        message = document.createElement("div");
        message.className = "error-message";
        message.id = `error-for-${id}`;

        // If the field is a radio button or checkbox, insert error after the label
        var label;
        if (field.type === 'radio' || field.type === 'checkbox') {
            label = field.form.querySelector('label[for="' + id + '"]') || field.parentNode;
            if (label) {
                label.parentNode.insertBefore(message, label.nextSibling);
            }
        }

        // Otherwise, insert it after the field
        if (!label) {
            field.parentNode.insertBefore(message, field.nextSibling);
        }
    }

    // Add ARIA role to the field
    field.setAttribute("aria-describedBy", `error-for-${id}`);

    // Update error message
    message.innerHTML = error;

    // Show error message
    message.style.display = "block";
    message.style.visibility = "visible";
}

function removeError(field) {
    // Remove error class from field
    field.classList.remove("error");

    // If the field is a radio button and part of a group, remove error from all and get the last item in the group
    if (field.type === 'radio' && field.name) {
        var group = document.getElementsByName(field.name);
        if (group.length > 0) {
            for (var i = 0; i < group.length; i++) {
                // Only check fields in current form
                if (group[i].form !== field.form) continue;
                group[i].classList.remove('error');
            }
            field = group[group.length - 1];
        }
    }

    // Remove ARIA role from field
    field.removeAttribute("aria-describedby");

    // Get field id or name
    let id = field.id || field.name;
    if (!id) return;

    // Check if an error message is in the DOM
    let message = field.form.querySelector(`.error-message#error-for-${id}`);
    if (!message) return;

    // If so, hide it
    message.innerHTML = "";
    message.style.display = "none";
    message.style.visibility = "hidden";
}