import {
  UseMutateFunction,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';
import jsonpatch from 'fast-json-patch';

import type { User } from '../../../../../shared/types';
import { axiosInstance, getJWTHeader } from '../../../axiosInstance';
import { queryKeys } from '../../../react-query/constants';
import { useCustomToast } from '../../app/hooks/useCustomToast';
import { useUser } from './useUser';

// for when we need a server function
async function patchUserOnServer(
  newData: User | null,
  originalData: User | null,
): Promise<User | null> {
  if (!newData || !originalData) return null;
  // create a patch for the difference between newData and originalData
  const patch = jsonpatch.compare(originalData, newData);

  // send patched data to the server
  const { data } = await axiosInstance.patch(
    `/user/${originalData.id}`,
    { patch },
    {
      headers: getJWTHeader(originalData),
    },
  );
  return data.user;
}

// TODO: update type to UseMutateFunction type
export function usePatchUser(): UseMutateFunction<
  User,
  unknown,
  User,
  unknown
> {
  const queryClient = useQueryClient();
  const toast = useCustomToast();
  const { user, updateUser } = useUser();
  const { mutate } = useMutation(
    (newUser: User) => patchUserOnServer(newUser, user),
    {
      // onMutate returns context that is passed to onError
      onMutate: async (newData: User | null) => {
        // cancel any outgoing queries for user data, so old server data doesnot overwrite optimistic update
        queryClient.cancelQueries([queryKeys.user]);
        // snapshot of prev user value
        const prevUserData: User = queryClient.getQueryData([queryKeys.user]);

        // optimistically update the cache with new user value
        updateUser(newData);
        // return context object with snapshoted value
        return { prevUserData };
      },
      onError: (err, newData, context) => {
        if (context.prevUserData) {
          updateUser(context.prevUserData);
          toast({ title: 'Update failed', status: 'warning' });
        }
      },
      onSuccess: (data) => {
        if (data) {
          updateUser(data);
          toast({ title: 'User has been updated', status: 'success' });
        }
      },
      onSettled: () => {
        // invalidates user query to make sure we are in sync with server data
        queryClient.invalidateQueries([queryKeys.user]);
      },
    },
  );

  return mutate;
}
