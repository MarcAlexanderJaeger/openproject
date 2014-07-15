module API
  module V3
    module WorkPackages
      class WatchersAPI < Grape::API


        resources :watchers do
          params do
            requires :user_id, desc: 'The watcher\'s user id'
          end

          post do
            if current_user.id == params[:user_id].to_i
              authorize(:view_work_packages, context: @work_package.project)
            else
              authorize(:add_work_package_watchers, context: @work_package.project)
            end

            user = User.find params[:user_id]

            Services::CreateWatcher.new(@work_package, user).run(
              -> (result) { status(200) unless result[:created]},
              -> (watcher) { raise ::API::Errors::Validation.new(watcher) }
            )

            model = ::API::V3::Users::UserModel.new(user)
            @representer = ::API::V3::Users::UserRepresenter.new(model).to_json
          end

          namespace ':user_id' do
            delete do
              if current_user.id == params[:user_id].to_i
                authorize(:view_work_packages, context: @work_package.project)
              else
                authorize(:delete_work_package_watchers, context: @work_package.project)
              end

              user = User.find_by_id params[:user_id]

              Services::RemoveWatcher.new(@work_package, user).run

              status 204
            end
          end

        end
      end
    end
  end
end
