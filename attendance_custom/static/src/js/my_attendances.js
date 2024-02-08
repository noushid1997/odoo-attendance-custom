odoo.define('attendance_custom.my_attendances', function (require) {
"use strict";

var core = require('web.core');
var field_utils = require('web.field_utils');

const session = require('web.session');
const HrAttendance = require('hr_attendance.my_attendances');

var MyAttendances = HrAttendance.include({
    contentTemplate: 'HrAttendanceMyMainMenu',
    events: {
        "click .o_hr_attendance_sign_in_out_icon": _.debounce(function() {
            this.update_attendance();
        }, 200, true),
        "click .select-project": '_onclick_project'
    },

    _onclick_project: function (ev) {
        var self = this;
        ev.preventDefault();
        var project = $(ev.currentTarget)[0].value;
        self.CurrentProject = project;
        this._rpc({
                model: 'project.task',
                method: 'get_task_details',
                args: [[],project],
                context: session.user_context,
            })
            .then(function (res) {
                var options = '';
                for (var i = 0; i < res.length; i++) {
                    options += '<option class="select-task" t-att-value="' + res[i].id + '">' + res[i].name + '</option> ';
                }
                self.$('.task-select')[0].innerHTML = options;
            });

    },

    willStart: function () {
        var self = this;

        var def = this._rpc({
                model: 'hr.employee',
                method: 'search_read',
                args: [[['user_id', '=', this.getSession().uid]], ['attendance_state', 'name', 'hours_today']],
                context: session.user_context,
            })
            .then(function (res) {
                self.employee = res.length && res[0];
                if (res.length) {
                    self.hours_today = field_utils.format.float_time(self.employee.hours_today);
                }
            });
        var project = this._rpc({
                model: 'project.project',
                method: 'get_project_details',
                args: [[]],
                context: session.user_context,
            })
            .then(function (res) {
                self.projects = res;
            });

        return Promise.all([def, this._super.apply(this, arguments)]);
    },

    update_attendance: function () {
        var self = this;
        var context = session.user_context
        if (self.employee.attendance_state=='checked_out'){
        if (!self.CurrentProject || !self.$('.select-task')[0]){
            alert("Project and Task is required");
            return ;
        }
        var project = self.CurrentProject;
        var task = self.$('.select-task')[0].getAttribute('t-att-value');
        context.project = project;
        context.task = task;
        }
        if (self.employee.attendance_state=='checked_in'){
            var desc = self.$('.user-desc')[0].value;
            if (!desc){
                alert("Description is required");
            return ;
            }
            context.desc = desc;
        }
        this._rpc({
                model: 'hr.employee',
                method: 'attendance_manual',
                args: [[self.employee.id], 'hr_attendance.hr_attendance_action_my_attendances'],
                context: context,
            })
            .then(function(result) {
                if (result.action) {
                    self.do_action(result.action);
                } else if (result.warning) {
                    self.displayNotification({ title: result.warning, type: 'danger' });
                }
            });
    },
});

});
