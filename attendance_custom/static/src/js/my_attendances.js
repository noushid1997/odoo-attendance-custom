odoo.define('attendance_custom.my_attendances', function (require) {
    "use strict";

    var core = require('web.core');
    var field_utils = require('web.field_utils');
    var session = require('web.session');
    var HrAttendance = require('hr_attendance.my_attendances');

    var _t = core._t;

    var MyAttendances = HrAttendance.include({
        contentTemplate: 'HrAttendanceMyMainMenu',
        events: {
            "click .o_hr_attendance_sign_in_out_icon": _.debounce(function () {
                this.update_attendance();
            }, 200, true),
            "click .select-project": '_onclick_project'
        },

        _onclick_project: function (ev) {
            var self = this;
            ev.preventDefault();
            var project = $(ev.currentTarget).val();
            self.CurrentProject = project;

            this._getTaskDetails(project).then(function (res) {
                var options = res.map(function (task) {
                    return '<option class="select-task" t-att-value="' + task.id + '">' + task.name + '</option>';
                });
                self.$('.task-select').html(options);
            });
        },

        _getTaskDetails: function (project) {
            return this._rpc({
                model: 'project.task',
                method: 'get_task_details',
                args: [[], project],
                context: session.user_context,
            });
        },

        willStart: function () {
            var self = this;

            var projectPromise = this._rpc({
                model: 'project.project',
                method: 'get_project_details',
                args: [[]],
                context: session.user_context,
            }).then(function (res) {
                self.projects = res;
            });

            return Promise.all([projectPromise, this._super.apply(this, arguments)]);
        },

        update_attendance: function () {
            var self = this;
            var context = session.user_context;

            if (self.employee.attendance_state === 'checked_out') {
                if (!self.CurrentProject || !self.$('.select-task').val()) {
                    alert(_t("Project and Task are required"));
                    return;
                }

                context.project = self.CurrentProject;
                context.task = self.$('.select-task').val();
            } else if (self.employee.attendance_state === 'checked_in') {
                var desc = self.$('.user-desc').val();
                if (!desc) {
                    alert(_t("Description is required"));
                    return;
                }
                context.desc = desc;
            }

            this._rpc({
                model: 'hr.employee',
                method: 'attendance_manual',
                args: [[self.employee.id], 'hr_attendance.hr_attendance_action_my_attendances'],
                context: context,
            }).then(function (result) {
                if (result.action) {
                    self.do_action(result.action);
                } else if (result.warning) {
                    self.displayNotification({ title: result.warning, type: 'danger' });
                }
            });
        },
    });

});
